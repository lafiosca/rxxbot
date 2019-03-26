// import socketIo, { Socket } from 'socket.io';
import Twitch from './modules/Twitch';
import * as twitchConfig from './config/twitch.json';

const api = null;

const initModules = async () => {
	const twitch = new Twitch(twitchConfig);
	console.log('Initializing modules');
	await Promise.all([
		twitch.initWithApi(api),
	]);
};

const onInitSuccess = () => {
	console.log('Initialized modules');
};

const onInitFailure = (error: any) => {
	console.error(`Failed to initialize modules: ${error}`);
};

initModules().then(onInitSuccess)
	.catch(onInitFailure);

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
