import socketIo, { Server, Socket } from 'socket.io';
import { ServerEvent } from 'rxxbot-types';
import AbstractConfigurableModule from './AbstractConfigurableModule';

export interface SocketIoConfig {
	port?: number;
}

class SocketIo extends AbstractConfigurableModule<SocketIoConfig> {
	protected readonly io: Server;

	constructor(config: SocketIoConfig = {}) {
		super({
			port: 23000,
			...config,
		});
		this.io = socketIo();
	}

	private superOnEvent: (event: ServerEvent) => Promise<void> = this.onEvent;

	protected init = async () => {
		this.io.on('connection', this.handleConnection);
		console.log(`SocketIo listening on port ${this.config.port!}`);
		this.io.listen(this.config.port!);
	}

	protected handleConnection = (socket: Socket) => {
		console.log(`Socket ${socket.id} connected`);
		socket.on('disconnect', this.createDisconnectHandler(socket));
		socket.on('command', this.createCommandHandler(socket));
	}

	protected createDisconnectHandler = (socket: Socket) => () => {
		console.log(`Socket ${socket.id} disconnected`);
	}

	protected createCommandHandler = (socket: Socket) => (payload: any) => {
		console.log(`Received command from socket ${socket.id}: ${JSON.stringify(payload, null, 2)}`);
	}

	public onEvent = async (event: ServerEvent) => {
		this.io.emit('serverEvent', event);
		this.superOnEvent(event);
	}
}

export default SocketIo;
