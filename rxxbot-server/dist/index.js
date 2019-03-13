"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = __importDefault(require("socket.io"));
const io = socket_io_1.default();
const handleConnection = (socket) => {
    console.log(`Socket ${socket.id} connected`);
    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
    });
    socket.on('command', (payload) => {
        console.log(`Received command from socket ${socket.id}: ${JSON.stringify(payload, null, 2)}`);
    });
};
io.on('connection', handleConnection);
console.log('Starting socketIo listener on 23000');
io.listen(23000);
setInterval(() => {
    console.log('Heartbeat');
    io.emit('heartbeat');
}, 1000);
