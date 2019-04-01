import TwitchClient, { AccessToken, PrivilegedUser } from 'twitch';
import TwitchChatClient from 'twitch-chat-client';

import ConfigurableServerModule from './ConfigurableServerModule';

export interface TwitchConfig {
	credentials: {
		clientId: string;
		clientSecret: string;
		refreshToken: string;
	};
	channel: string;
}

class Twitch extends ConfigurableServerModule<TwitchConfig> {
	protected twitch: TwitchClient | null = null;
	protected me: PrivilegedUser | null = null;

	protected init = async () => {
		await this.initTwitch();
		await this.initTwitchChat();
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
				onRefresh: (token: AccessToken) => {
					console.log(`Received new Twitch refresh token: ${token.refreshToken}`);
					this.config.credentials.refreshToken = token.refreshToken;
				},
			},
		);

		this.me = await this.twitch.users.getMe();
		console.log(`Logged into Twitch as: ${JSON.stringify(this.me, null, 2)}`);
	}

	protected initTwitchChat = async () => {
		const { channel } = this.config;

		try {
			console.log(`Getting user information for ${channel}`);
			const user = await this.twitch!.users.getUserByName(channel);
			if (!user) {
				throw new Error(`No user by name ${channel}`);
			}
			console.log(`Got user ${user.displayName}: ${JSON.stringify(user, null, 2)}`);
		} catch (error) {
			console.error(`Failed to get user ${channel}: ${error}`);
			console.error(error);
		}

		try {
			console.log('Creating Twitch chat client');
			const twitchChat = await TwitchChatClient.forTwitchClient(this.twitch!);

			console.log('Connecting to Twitch chat');
			await twitchChat.connect();

			console.log('Waiting for Twitch chat registration');
			await twitchChat.waitForRegistration();

			console.log('Establishing privMsg listener');
			twitchChat.onPrivmsg((channel, user, message, msg) => {
				console.log(`${new Date().toISOString()} ${channel} ${user}: ${message}`);
				const emotes = Array.from(msg.emoteOffsets.entries()).map(
					([key, value]) => `${key}: ${JSON.stringify(value)}`,
				).join(', ');
				console.log(`  emoteOffsets: ${emotes}`);
				console.log(`  isCheer: ${JSON.stringify(msg.isCheer)}`);
				console.log(`  totalBits: ${JSON.stringify(msg.totalBits)}`);
			});

			console.log(`Joining Twitch chat for '${channel}'`);
			await twitchChat.join(channel);
		} catch (error) {
			console.error(`Failed during IRC setup: ${error}`);
			console.error(error);
		}
	}

	protected onHeartbeat = async () => {
		console.log('Fetch foo from storage');
		const foo = await this.api!.fetch('foo');
		let newFoo: number;
		if (foo === null) {
			console.log('No foo set yet, initialize it');
			newFoo = 1;
		} else {
			newFoo = parseInt(foo, 10) + 1;
			console.log(`Foo = '${foo}'`);
		}
		console.log(`Update foo to '${newFoo}'`);
		await this.api!.store('foo', `${newFoo}`);

		try {
			console.log('Getting me from Twitch');
			this.me = await this.twitch!.users.getMe();
			console.log(`Logged into Twitch as: ${JSON.stringify(this.me, null, 2)}`);
		} catch (error) {
			console.error(`Failed to get me: ${error}`);
			console.error(error);
		}
	}
}

export default Twitch;
