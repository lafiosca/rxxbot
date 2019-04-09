import { ServerConfig } from 'rxxbot-types';
import Server from './Server';
import ConsoleLogger from './modules/ConsoleLogger';
import Twitch from './modules/Twitch';
import Heartbeat from './modules/Heartbeat';
import MemoryStore from './modules/MemoryStore';
import SocketIo from './modules/SocketIo';
import twitchConfig from './config/twitch.json';

const serverConfig: ServerConfig = {
	modules: [
		new MemoryStore(),
		new SocketIo(),
		new ConsoleLogger(),
		new Twitch(twitchConfig),
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
