import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactPlayer from 'react-player';
import './App.css';
import {
	addHeartbeatListener,
	removeHeartbeatListener,
	addMessageListener,
	removeMessageListener,
} from './services/socketIo';
import { MessageEvent } from 'rxxbot-types';

const publicUrl = process.env.PUBLIC_URL;

const Home = () => (
	<div>Home</div>
);

const Screen = () => {
	const [lastHeartbeat, setLastHeartbeat] = useState('none');
	const [playing, setPlaying] = useState(false);
	useEffect(
		() => {
			const listener = () => {
				setLastHeartbeat(new Date().toISOString());
			};
			console.log('adding heartbeat listener');
			addHeartbeatListener(listener);
			return () => {
				console.log('removing heartbeat listener');
				removeHeartbeatListener(listener);
			};
		},
		[setLastHeartbeat],
	);
	useEffect(
		() => {
			const listener = (event: MessageEvent) => {
				console.log(`Received server message event: ${JSON.stringify(event, null, 2)}`);
				if (event.messageType === 'cheer') {
					console.log(`Cheer from ${event.message.user}`);
					if (!playing) {
						console.log('Start video!');
						// setPlaying(true);
					} else {
						console.log('Video already playing!');
					}
				}
			};
			console.log('adding message listener');
			addMessageListener(listener);
			return () => {
				console.log('removing message listener');
				removeMessageListener(listener);
			};
		},
		[playing, setPlaying],
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
