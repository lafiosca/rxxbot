import React, { Component } from 'react';
import socketIoClient from 'socket.io-client';
import './App.css';

interface Props {}

interface State {
	socket: SocketIOClient.Socket;
	lastHeartbeat: string;
}

const prepareSocket = (updateState: (state: Partial<State>) => void) => {
	const socket = socketIoClient('http://localhost:23000');
	socket.on('serverEvent', (payload: any) => {
		console.log(`Received server event: ${JSON.stringify(payload, null, 2)}`);
		if (payload.type === 'heartbeat') {
			console.log('It\'s a heartbeat!');
			updateState({ lastHeartbeat: new Date().toISOString() });
		}
	});
	return socket;
};

class App extends Component<Props, State> {
	updateState = (state: Partial<State>) => {
		this.setState({
			...this.state,
			...state,
		});
	}

	readonly state: Readonly<State> = {
		socket: prepareSocket(this.updateState),
		lastHeartbeat: 'none',
	};

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<p>
						Last heartbeat: {this.state.lastHeartbeat}
					</p>
				</header>
			</div>
		);
	}
}

export default App;
