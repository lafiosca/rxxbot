import socketIo, { Socket } from 'socket.io';
import Twitch, { AccessToken } from 'twitch';
import TwitchChatClient from 'twitch-chat-client';

import {
	clientId,
	clientSecret,
	accessToken,
	refreshToken,
} from './config.json';

const setupTwitch = async () => {
	console.log('Creating Twitch client');
	const twitch = Twitch.withCredentials(
		clientId,
		accessToken,
		{
			clientSecret,
			refreshToken,
			onRefresh: (token: AccessToken) => {
				console.log(`new refresh token: ${token.refreshToken}`);
			},
		},
	);

	const username = 'rhiow2';

	try {
		const user = await twitch.users.getUserByName(username);
		if (!user) {
			console.log(`No user by name ${username}`);
		} else {
			console.log(`Got user ${user.displayName}: ${JSON.stringify(user, null, 2)}`);
		}
	} catch (error) {
		console.log(`Failed to get user ${username}: ${error}`);
		console.error(error);
	}

	try {
		console.log('Creating Twitch chat client');
		const twitchChat = await TwitchChatClient.forTwitchClient(twitch);

		console.log('Connecting to Twitch chat');
		await twitchChat.connect();

		console.log('Waiting for Twitch chat registration');
		await twitchChat.waitForRegistration();

		console.log('Establishing privMsg listener');
		twitchChat.onPrivmsg((channel, user, message, msg) => {
			console.log(`${new Date().toISOString()} #${channel} ${user}: ${message}`);
			console.log(`  emoteOffsets: ${JSON.stringify(msg.emoteOffsets)}`);
			console.log(`  isCheer: ${JSON.stringify(msg.isCheer)}`);
			console.log(`  totalBits: ${JSON.stringify(msg.totalBits)}`);
		});
		// chatClient.removeListener(followAgeListener);

		console.log(`Joining Twitch chat for '${username}'`);
		await twitchChat.join(username);
	} catch (error) {
		console.log(`Failed during IRC setup: ${error}`);
		console.error(error);
	}
};

const setupSocketIo = () => {
	const io = socketIo();

	const handleConnection = (socket: Socket) => {
		console.log(`Socket ${socket.id} connected`);
		socket.on('disconnect', () => {
			console.log(`Socket ${socket.id} disconnected`);
		});
		socket.on('command', (payload: any) => {
			console.log(`Received command from socket ${socket.id}: ${JSON.stringify(payload, null, 2)}`);
		});
	};

	io.on('connection', handleConnection);

	console.log('Starting socketIo listener on 23000');
	io.listen(23000);

	return io;
};

// const io = setupSocketIo();

setupTwitch();

// setInterval(
// 	() => {
// 		console.log('Heartbeat');
// 		io.emit('heartbeat');
// 	},
// 	10000,
// );
