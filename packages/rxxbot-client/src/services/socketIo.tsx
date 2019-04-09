import socketIoClient from 'socket.io-client';
import {
	ServerEvent,
	ServerEventType,
	MessageEvent,
	HeartbeatEvent,
} from 'rxxbot-types';

type Listener = (event: ServerEvent) => void;
type MessageListener = (event: MessageEvent) => void;
type HearbeatListener = (event: HeartbeatEvent) => void;

const messageListeners: MessageListener[] = [];
const hearbeatListeners: HearbeatListener[] = [];

const socket = socketIoClient('http://localhost:23000');

const metaListener = (event: ServerEvent) => {
	switch (event.type) {
		case ServerEventType.Message:
			messageListeners.forEach((listener) => listener(event));
			break;
		case ServerEventType.Heartbeat:
			hearbeatListeners.forEach((listener) => listener(event));
			break;
	}
};

socket.on('serverEvent', metaListener);

export const addServerEventListener = (listener: Listener) => {
	socket.on('serverEvent', listener);
};

export const removeServerEventListener = (listener: Listener) => {
	socket.off('serverEvent', listener);
};

export const addMessageListener = (listener: MessageListener) => {
	messageListeners.push(listener);
};

export const removeMessageListener = (listener: MessageListener) => {
	for (let i = 0; i < messageListeners.length; i += 1) {
		if (messageListeners[i] === listener) {
			messageListeners.splice(i, 1);
			break;
		}
	}
};

export const addHeartbeatListener = (listener: HearbeatListener) => {
	hearbeatListeners.push(listener);
};

export const removeHeartbeatListener = (listener: HearbeatListener) => {
	for (let i = 0; i < hearbeatListeners.length; i += 1) {
		if (hearbeatListeners[i] === listener) {
			hearbeatListeners.splice(i, 1);
			break;
		}
	}
};
