import Server from './Server';
import { ServerConfig } from './types';
import ConsoleLogger from './modules/ConsoleLogger';
import Twitch from './modules/Twitch';
import twitchConfig from './config/twitch.json';
import Heartbeat from './modules/Heartbeat';
import MemoryStore from './modules/MemoryStore';

const serverConfig: ServerConfig = {
	modules: [
		new MemoryStore(),
		new ConsoleLogger(),
		new Twitch(twitchConfig),
		{
			module: new Heartbeat({ interval: 1800000 }),
			privileged: true,
		},
	],
};

const server = new Server(serverConfig);

server.listen()
	.then(() => {
		console.log('Server listening');
	})
	.catch((error) => {
		// TODO: gracefully clean up and exit
		console.error(`Failed to initialize server: ${error}`);
		process.exit(1);
	});
