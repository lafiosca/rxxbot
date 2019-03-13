import socketIo, { Socket } from 'socket.io';

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

setInterval(
	() => {
		console.log('Heartbeat');
		io.emit('heartbeat');
	},
	10000,
);
