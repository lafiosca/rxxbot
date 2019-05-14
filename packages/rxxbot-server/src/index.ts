import {
	ServerConfig,
	TwitchMessageType,
	TwitchMessageEventJoin,
} from 'rxxbot-types';
import Server from './Server';
import ConsoleLogger from './modules/ConsoleLogger';
import Twitch from './modules/Twitch';
import TwitchAlerts from './modules/TwitchAlerts';
import Heartbeat from './modules/Heartbeat';
import MemoryStore from './modules/MemoryStore';
import SocketIo from './modules/SocketIo';
import twitchConfig from './config/twitch.json';

const serverConfig: ServerConfig = {
	modules: [
		new MemoryStore(),
		{
			module: new SocketIo(),
			privileged: true,
		},
		new ConsoleLogger(),
		new Twitch(twitchConfig),
		new TwitchAlerts({
			channel: 'lafiosca',
			alerts: [
				{
					type: TwitchMessageType.Chat,
					templates: [
						'Incoming chat message from @{user}',
						'More words from @{user}',
					],
					videos: [
						{
							video: 'macho-madness-ooh-yeah.mp4',
							templates: ['Ooh yeah, {user}\'s talkin!'],
						},
						'bill-cipher-buy-gold.mp4',
						{
							video: 'brent-rambo.mp4',
							templates: null,
						},
						{
							video: 'come-play-with-us.mp4',
							templates: ['Come play with us, @{user}! Forever and ever and ever!'],
						},
						{
							video: 'kitty-city.mp4',
							templates: ['Welcome to kitty city, @{user}!'],
						},
					],
				},
				{
					type: TwitchMessageType.Join,
					callback: (message) => {
						switch ((message as TwitchMessageEventJoin['message']).user) {
							case 'slurpeeeye':
								return {
									videos: ['bill-cipher-buy-gold.mp4'],
									templates: ['Hey, it\'s @SlurpeeEye!'],
								};
							default:
								return null;
						}
					},
				},
			],
		}),
		{
			module: new Heartbeat({ interval: 30000 }),
			privileged: true,
		},
	],
};

const server = new Server(serverConfig);

server.run()
	.then(() => {
		console.log('Server running');
	})
	.catch((error) => {
		// TODO: gracefully clean up and exit
		console.error(`Failed to initialize server: ${error}`);
		process.exit(1);
	});
