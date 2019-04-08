import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import socketIoClient from 'socket.io-client';
import ReactPlayer from 'react-player';
import './App.css';

const publicUrl = process.env.PUBLIC_URL;

const Home = () => (
	<div>Home</div>
);

const Screen = () => {
	const [lastHeartbeat, setLastHeartbeat] = useState('none');
	const [playing, setPlaying] = useState(false);
	useEffect(
		() => {
			const socket = socketIoClient('http://localhost:23000');
			const listener = (payload: any) => {
				if (payload.type === 'message') {
					payload.message = JSON.parse(payload.message);
				}
				if (payload.type === 'heartbeat') {
					// console.log('It\'s a heartbeat!');
					setLastHeartbeat(new Date().toISOString());
				} else if (payload.messageType === 'chat') {
					// do nothing
				} else {
					console.log(`Received server event: ${JSON.stringify(payload, null, 2)}`);
					// console.log('It\'s something else!');
					if (!playing) {
						// console.log('Start video!');
						// setPlaying(true);
					} else {
						// console.log('Video already playing!');
					}
				}
			};
			console.log('turn serverEvent listener on');
			socket.on('serverEvent', listener);
			return () => {
				console.log('turn serverEvent listener off');
				socket.off('serverEvent', listener);
			};
		},
		[playing],
	);
	return (
		<header className="App-header">
			<p>
				Last heartbeat: {lastHeartbeat}
			</p>
			<div className={playing ? 'videoArea' : 'videoArea hide'}>
				<ReactPlayer
					url={`${publicUrl}/assets/macho-madness-ooh-yeah.mp4`}
					playing={playing}
					onEnded={() => setPlaying(false)}
				/>
			</div>
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
				<Switch>
					<Route exact path="/" component={Home} />
					<Route path="/screen" component={Screen} />
					<Route component={NoMatch} />
				</Switch>
			</div>
		</Router>
	);
};

export default App;
