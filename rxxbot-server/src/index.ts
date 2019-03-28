import Server from './Server';
import { ServerConfig } from './types';
import ConsoleLogger from './modules/ConsoleLogger';
import Twitch from './modules/Twitch';
import twitchConfig from './config/twitch.json';

const serverConfig: ServerConfig = {
	modules: [
		new ConsoleLogger(),
		new Twitch(twitchConfig),
	],
};

const server = new Server(serverConfig);

server.listen()
	.then(() => {
		console.log('Server listening');
	})
	.catch((error) => {
		console.error(`Failed to initialize server: ${error}`);
	});
