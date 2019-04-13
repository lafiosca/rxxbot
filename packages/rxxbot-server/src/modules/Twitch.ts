import TwitchClient, { AccessToken, PrivilegedUser } from 'twitch';
import TwitchChatClient from 'twitch-chat-client';
import TwitchPrivateMessage from 'twitch-chat-client/lib/StandardCommands/PrivateMessage';
import {
	TwitchConfig,
	TwitchMessageType,
	ExtractTwitchMessage,
	TwitchEmoteOffsets,
} from 'rxxbot-types';

import AbstractConfigurableModule from './AbstractConfigurableModule';

const convertEmoteOffsets = (emoteOffsets: TwitchPrivateMessage['emoteOffsets']) =>
	Array.from(emoteOffsets.entries()).reduce(
		(eo, [key, value]) => ({
			...eo,
			[key]: value,
		}),
		{} as TwitchEmoteOffsets,
	);

class Twitch extends AbstractConfigurableModule<TwitchConfig> {
	protected twitch: TwitchClient | null = null;
	protected me: PrivilegedUser | null = null;

	protected init = async () => {
		await this.initTwitch();
		await this.initTwitchChat();
	}

	protected onRefresh = (token: AccessToken) => {
		console.log(`Received new Twitch refresh token: ${token.refreshToken}`);
		this.config.credentials.refreshToken = token.refreshToken;
	}

	protected initTwitch = async () => {
		console.log('Twitch::init');
		const {
			clientId,
			clientSecret,
			refreshToken,
		} = this.config.credentials;

		console.log('Creating Twitch client');
		this.twitch = await TwitchClient.withCredentials(
			clientId,
			undefined, // no access token, only refresh token
			[
				// 'analytics:read:extensions',
				// 'analytics:read:games',
				'bits:read',
				'channel:read:subscriptions',
				// 'clips:edit',
				// 'user:edit',
				// 'user:edit:broadcast',
				'user:read:broadcast',
				// 'user:read:email',
				'user_read',
				'channel:moderate',
				'chat:edit',
				'chat:read',
				'whispers:read',
				'whispers:edit',
			],
			{
				clientSecret,
				refreshToken,
				onRefresh: this.onRefresh,
			},
		);

		this.me = await this.twitch.users.getMe();
		console.log(`Logged into Twitch as: ${JSON.stringify(this.me, null, 2)}`);
	}

	protected initTwitchChat = async () => {
		const { channels } = this.config;

		if (channels.length === 0) {
			throw new Error('No channels specified to join');
		}

		await Promise.all(channels.map(async (channel) => {
			const user = await this.twitch!.users.getUserByName(channel);
			if (!user) {
				throw new Error(`Invalid channel: ${channel}`);
			}
		}));

		try {
			// console.log('Creating Twitch chat client');
			const twitchChat = await TwitchChatClient.forTwitchClient(this.twitch!);

			// console.log('Connecting to Twitch chat');
			await twitchChat.connect();

			// console.log('Waiting for Twitch chat registration');
			await twitchChat.waitForRegistration();

			// console.log('Establishing onBitsBadgeUpgrade listener');
			twitchChat.onBitsBadgeUpgrade((channel, user, upgradeInfo, msg) => {
				this.sendMessage(
					TwitchMessageType.BitsBadgeUpgrade,
					{
						channel,
						user,
						displayName: upgradeInfo.displayName,
						threshold: upgradeInfo.threshold,
					},
				);
			});

			// console.log('Establishing onChatClear listener');
			twitchChat.onChatClear((channel) => {
				this.sendMessage(
					TwitchMessageType.ChatClear,
					{ channel },
				);
			});

			// console.log('Establishing onCommunitySub listener');
			twitchChat.onCommunitySub((channel, user, subInfo, msg) => {
				const anon = !!subInfo.gifter;
				this.sendMessage(
					TwitchMessageType.CommunitySub,
					{
						channel,
						user,
						count: subInfo.count,
						plan: subInfo.plan,
						...(!anon
							? {
								gifter: subInfo.gifter!,
								gifterDisplayName: subInfo.gifterDisplayName!,
								gifterGiftCount: subInfo.gifterGiftCount!,
							}
							: {}),
					},
				);
			});

			// console.log('Establishing onEmoteOnly listener');
			twitchChat.onEmoteOnly((channel, enabled) => {
				this.sendMessage(
					TwitchMessageType.EmoteOnly,
					{ channel, enabled },
				);
			});

			// console.log('Establishing onFollowersOnly listener');
			twitchChat.onFollowersOnly((channel, enabled, delay) => {
				this.sendMessage(
					TwitchMessageType.FollowersOnly,
					enabled ? {
						channel,
						enabled,
						delay: delay!,
					} : {
						channel,
						enabled,
					},
				);
			});

			// console.log('Establishing onHost listener');
			twitchChat.onHost((channel, target, viewers) => {
				this.sendMessage(
					TwitchMessageType.Host,
					{
						channel,
						target,
						...(viewers === undefined ? {} : { viewers }),
					},
				);
			});

			// console.log('Establishing onHosted listener');
			twitchChat.onHosted((channel, byChannel, auto, viewers) => {
				this.sendMessage(
					TwitchMessageType.Hosted,
					{
						channel,
						byChannel,
						auto,
						...(viewers === undefined ? {} : { viewers }),
					},
				);
			});

			// console.log('Establishing onHostsRemaining listener');
			twitchChat.onHostsRemaining((channel, numberOfHosts) => {
				this.sendMessage(
					TwitchMessageType.HostsRemaining,
					{
						channel,
						numberOfHosts,
					},
				);
			});

			// console.log('Establishing onJoin listener');
			twitchChat.onJoin((channel, user) => {
				this.sendMessage(TwitchMessageType.Join, { channel, user });
			});

			// console.log('Establishing onPart listener');
			twitchChat.onPart((channel, user) => {
				this.sendMessage(TwitchMessageType.Part, { channel, user });
			});

			// console.log('Establishing onPrivMsg listener (cheer/message)');
			twitchChat.onPrivmsg((channel, user, message, msg) => {
				this.sendMessage(
					msg.isCheer ? TwitchMessageType.Cheer : TwitchMessageType.Chat,
					{
						...(msg.isCheer ? { totalBits: msg.totalBits } : {}),
						channel,
						user,
						message,
						emoteOffsets: convertEmoteOffsets(msg.emoteOffsets),
					},
				);
			});

			// console.log('Establishing onR9k listener');
			twitchChat.onR9k((channel, enabled) => {
				this.sendMessage(TwitchMessageType.R9k, { channel, enabled });
			});

			// console.log('Establishing onRaid listener');
			twitchChat.onRaid((channel, user, raidInfo, msg) => {
				this.sendMessage(
					TwitchMessageType.Raid,
					{
						channel,
						user,
						displayName: raidInfo.displayName,
						viewerCount: raidInfo.viewerCount,
					},
				);
			});

			// console.log('Establishing onResub listener');
			twitchChat.onResub((channel, user, subInfo, msg) => {
				this.sendMessage(
					TwitchMessageType.Resub,
					{
						channel,
						user,
						displayName: subInfo.displayName,
						isPrime: subInfo.isPrime,
						plan: subInfo.plan,
						planName: subInfo.planName,
						months: subInfo.months,
						...(subInfo.message
							? {
								message: subInfo.message,
								emoteOffsets: convertEmoteOffsets(msg.emoteOffsets),
							}
							: {}),
					},
				);
			});

			// console.log('Establishing onRitual listener');
			twitchChat.onRitual((channel, user, ritualInfo, msg) => {
				const newChatter = ritualInfo.ritualName === 'new_chatter';
				this.sendMessage(
					newChatter ? TwitchMessageType.NewChatter : TwitchMessageType.Ritual,
					{
						channel,
						user,
						...(newChatter ? {} : { ritualName: ritualInfo.ritualName }),
					},
				);
			});

			// console.log('Establishing onSlow listener');
			twitchChat.onSlow((channel, enabled, delay) => {
				this.sendMessage(
					TwitchMessageType.Slow,
					enabled ? {
						channel,
						enabled,
						delay: delay!,
					} : {
						channel,
						enabled,
					},
				);
			});

			// console.log('Establishing onSub listener');
			twitchChat.onSub((channel, user, subInfo, msg) => {
				this.sendMessage(
					TwitchMessageType.Sub,
					{
						channel,
						user,
						displayName: subInfo.displayName,
						isPrime: subInfo.isPrime,
						months: subInfo.months,
						plan: subInfo.plan,
						planName: subInfo.planName,
						...(subInfo.streak ? { streak: subInfo.streak } : {}),
						...(subInfo.message
							? {
								message: subInfo.message,
								emoteOffsets: convertEmoteOffsets(msg.emoteOffsets),
							}
							: {}),
					},
				);
			});

			// console.log('Establishing onSubGift listener');
			twitchChat.onSubGift((channel, user, subInfo, msg) => {
				const anon = !!subInfo.gifter;
				this.sendMessage(
					TwitchMessageType.SubGift,
					{
						channel,
						user,
						displayName: subInfo.displayName,
						isPrime: subInfo.isPrime,
						months: subInfo.months,
						plan: subInfo.plan,
						planName: subInfo.planName,
						...(subInfo.streak ? { streak: subInfo.streak } : {}),
						...(subInfo.message
							? {
								message: subInfo.message,
								emoteOffsets: convertEmoteOffsets(msg.emoteOffsets),
							}
							: {}),
						...(!anon
							? {
								gifter: subInfo.gifter!,
								gifterDisplayName: subInfo.gifterDisplayName!,
								gifterGiftCount: subInfo.gifterGiftCount!,
							}
							: {}),
					},
				);
			});

			// console.log('Establishing onSubsOnly listener');
			twitchChat.onSubsOnly((channel, enabled) => {
				this.sendMessage(TwitchMessageType.SubsOnly, { channel, enabled });
			});

			// console.log('Establishing onTimeout listener');
			twitchChat.onTimeout((channel, user, reason, duration) => {
				this.sendMessage(
					TwitchMessageType.Timeout,
					{
						channel,
						user,
						reason,
						duration,
					},
				);
			});

			// console.log('Establishing onUnhost listener');
			twitchChat.onUnhost((channel) => {
				this.sendMessage(TwitchMessageType.Unhost, { channel });
			});

			// console.log('Establishing onWhisper listener');
			twitchChat.onWhisper((user, message, msg) => {
				this.sendMessage(
					TwitchMessageType.Whisper,
					{
						user,
						message,
						emoteOffsets: convertEmoteOffsets(msg.emoteOffsets),
					},
				);
			});

			await Promise.all(channels.map((channel) => twitchChat.join(channel)));
		} catch (error) {
			throw new Error(`Failed during Twitch IRC setup: ${error}`);
		}
	}

	protected sendMessage = <T extends TwitchMessageType>(
		messageType: T,
		message: ExtractTwitchMessage<T>,
	) => this.api!.sendMessage(messageType, message)

	protected onHeartbeat = async () => {
		// console.log('Fetch foo from storage');
		// const foo = await this.api!.fetch('foo');
		// let newFoo: number;
		// if (foo === null) {
		// 	console.log('No foo set yet, initialize it');
		// 	newFoo = 1;
		// } else {
		// 	newFoo = parseInt(foo, 10) + 1;
		// 	console.log(`Foo = '${foo}'`);
		// }
		// console.log(`Update foo to '${newFoo}'`);
		// await this.api!.store('foo', `${newFoo}`);

		// try {
		// 	console.log('Getting me from Twitch');
		// 	this.me = await this.twitch!.users.getMe();
		// 	console.log(`Logged into Twitch as: ${JSON.stringify(this.me, null, 2)}`);
		// } catch (error) {
		// 	console.error(`Failed to get me: ${error}`);
		// 	console.error(error);
		// }
	}
}

export default Twitch;
