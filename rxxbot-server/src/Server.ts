import {
	ServerConfig,
	FullModuleSpec,
	ModuleSpec,
	ServerEventType,
	ServerEvent,
} from './types';
import ServerModule from './modules/ServerModule';

class Server {
	protected readonly api: any;
	protected readonly moduleSpecs: FullModuleSpec[] = [];

	constructor(config: ServerConfig) {
		this.api = null;
		this.normalizeModules(config.modules);
	}

	protected normalizeModules = (modules: ModuleSpec[]) => {
		modules.forEach((module) => {
			if (module instanceof ServerModule) {
				this.moduleSpecs.push({ module });
			} else {
				this.moduleSpecs.push(module);
			}
		});
	}

	protected moduleMap = (mapping: (module: ServerModule) => any) =>
		Promise.all(this.moduleSpecs.map(({ module }) => mapping(module)))

	protected sendEvent = async (event: ServerEvent) =>
		this.moduleMap((module) => module.onEvent(event))

	public listen = async () => {
		await this.moduleMap((module) => module.initWithApi(this.api));
		this.sendEvent({ type: ServerEventType.InitComplete });
		setInterval(
			() => this.sendEvent({ type: ServerEventType.Heartbeat }),
			1800000,
		);
	}
}

export default Server;

// import socketIo, { Socket } from 'socket.io';

// const setupSocketIo = () => {
// 	const io = socketIo();

// 	const handleConnection = (socket: Socket) => {
// 		console.log(`Socket ${socket.id} connected`);
// 		socket.on('disconnect', () => {
// 			console.log(`Socket ${socket.id} disconnected`);
// 		});
// 		socket.on('command', (payload: any) => {
// 			console.log(`Received command from socket ${socket.id}: ${JSON.stringify(payload, null, 2)}`);
// 		});
// 	};

// 	io.on('connection', handleConnection);

// 	console.log('Starting socketIo listener on 23000');
// 	io.listen(23000);

// 	return io;
// };

// const io = setupSocketIo();

// setInterval(
// 	() => {
// 		console.log('Heartbeat');
// 		io.emit('heartbeat');
// 	},
// 	10000,
// );
