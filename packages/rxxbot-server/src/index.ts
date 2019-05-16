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
					captionTemplates: [
						'Incoming chat message from @{user}',
						'More words from @{user}',
					],
					crawlTemplates: [
						'arbitrary crawl test',
						'other crawl test',
					],
					videos: [
						{
							video: 'follow/macho-madness-ooh-yeah.mp4',
							captionTemplates: ['Ooh yeah, @{user}\'s talkin!'],
						},
						{
							video: 'triggers/bill-cipher-buy-gold.mp4',
							crawlTemplates: [
								'Remember! Reality\'s an illusion, the universe is a hologram, buy gold! Byeeee!',
							],
						},
						{
							video: 'follow/brent-rambo.mp4',
							captionTemplates: null,
							crawlTemplates: [
								'Thumbs up to @{user}!',
								'Macs rule the world!',
							],
						},
						{
							video: 'follow/come-play-with-us.mp4',
							captionTemplates: ['Come play with us, @{user}! Forever and ever and ever!'],
						},
						{
							video: 'follow/kitty-city.mp4',
							captionTemplates: ['Welcome to kitty city, @{user}!'],
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
									captionTemplates: ['Hey, it\'s @SlurpeeEye!'],
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
