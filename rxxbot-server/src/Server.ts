import {
	ServerConfig,
	ModuleSpecConfig,
	ServerEventType,
	ServerEvent,
	ServerApi,
	ModuleSpec,
	ModuleSpecMap,
} from './types';
import ServerModule from './modules/ServerModule';

class Server {
	protected readonly moduleSpecs: ModuleSpec[] = [];
	protected readonly moduleSpecsById: ModuleSpecMap = {};

	constructor(config: ServerConfig) {
		this.normalizeModuleSpecs(config.modules);
	}

	protected normalizeModuleSpecs = (moduleSpecConfigs: ModuleSpecConfig[]) => {
		moduleSpecConfigs.forEach((config) => {
			let moduleSpec: ModuleSpec;
			if (config instanceof ServerModule) {
				moduleSpec = {
					id: config.getDefaultModuleId()
						|| config.constructor.name,
					type: 'basic',
					module: config,
					privileged: false,
				};
			} else {
				moduleSpec = {
					id: config.id
						|| config.module.getDefaultModuleId()
						|| config.module.constructor.name,
					type: config.type || 'basic',
					module: config.module,
					privileged: config.privileged || false,
				};
			}
			this.moduleSpecs.push(moduleSpec);
		});
		this.moduleSpecs.forEach((moduleSpec) => {
			if (this.moduleSpecsById[moduleSpec.id]) {
				throw new Error(`Each module must have a unique id; found duplicate '${moduleSpec.id}'`);
			}
			this.moduleSpecsById[moduleSpec.id] = moduleSpec;
		});
	}

	protected moduleMap = async (mapping: (moduleSpec: ModuleSpec) => any) =>
		Promise.all(this.moduleSpecs.map(mapping))

	protected sendEvent = async (event: ServerEvent) => {
		await this.moduleMap((moduleSpec) => moduleSpec.module.onEvent(event));
	}

	protected sendMessage = (fromModuleId: string, message: string) =>
		this.sendEvent({
			fromModuleId,
			message,
			type: ServerEventType.Message,
		})

	protected heartbeat = () =>
		this.sendEvent({ type: ServerEventType.Heartbeat })

	protected buildApiForModule = (moduleSpec: ModuleSpec) => {
		const api: ServerApi = {
			sendMessage: (message: string) =>
				this.sendMessage(moduleSpec.id, message),
		};
		if (moduleSpec.privileged) {
			api.heartbeat = this.heartbeat;
		}
		return api;
	}

	public listen = async () => {
		// TODO: check for module init failures, gracefully clean up and exit
		await this.moduleMap((moduleSpec) =>
			moduleSpec.module.initWithApi(
				this.buildApiForModule(moduleSpec),
			));
		await this.sendEvent({ type: ServerEventType.InitComplete });
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
