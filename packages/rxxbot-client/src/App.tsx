import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import socketIoClient from 'socket.io-client';
import './App.css';

const Home = () => (
	<div>Home</div>
);

const Screen = () => {
	const [lastHeartbeat, setLastHeartbeat] = useState('none');
	useEffect(
		() => {
			const socket = socketIoClient('http://localhost:23000');
			const listener = (payload: any) => {
				console.log(`Received server event: ${JSON.stringify(payload, null, 2)}`);
				if (payload.type === 'heartbeat') {
					console.log('It\'s a heartbeat!');
					setLastHeartbeat(new Date().toISOString());
				}
			};
			console.log('turn serverEvent listener on');
			socket.on('serverEvent', listener);
			return () => {
				console.log('turn serverEvent listener off');
				socket.off('serverEvent', listener);
			};
		},
		[],
	);
	return (
		<header className="App-header">
			<p>
				Last heartbeat: {lastHeartbeat}
			</p>
		</header>
	);
};

const NoMatch = () => (
	<div>Not Found</div>
);

const App = () => {
	return (
		<Router>
			<div className="App">
				<Route exact path="/" component={Home} />
				<Route path="/screen" component={Screen} />
				<Route component={NoMatch} />
			</div>
		</Router>
	);
};

export default App;
