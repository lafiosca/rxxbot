import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
	addMessageListener,
	removeMessageListener,
} from '../services/socketIo';
import { MessageEvent } from 'rxxbot-types';
import '../App.css';

const publicUrl = process.env.PUBLIC_URL;

const VideoAlerts = () => {
	const [playing, setPlaying] = useState(false);
	useEffect(
		() => {
			const listener = (event: MessageEvent) => {
				console.log(`Received server message event: ${JSON.stringify(event, null, 2)}`);
				if (event.messageType === 'cheer') {
					console.log(`Cheer from ${event.message.user}`);
				} else if (event.messageType === 'chat') {
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
		<div className="screen">
			<div className="screen upperLeft">
				<div className="alertText">hello1</div>
				<div className={playing ? 'videoArea' : 'videoArea hide'}>
					<ReactPlayer
						url={`${publicUrl}/assets/macho-madness-ooh-yeah.mp4`}
						playing={playing}
						onEnded={() => setPlaying(false)}
					/>
				</div>
			</div>
			<div className="screen upperRight">
				<div className="alertText">hello2</div>
				<div className={playing ? 'videoArea' : 'videoArea hide'}>
					<ReactPlayer
						url={`${publicUrl}/assets/macho-madness-ooh-yeah.mp4`}
						playing={playing}
						onEnded={() => setPlaying(false)}
					/>
				</div>
			</div>
			<div className="screen lowerLeft">
				<div className="alertText">hello3</div>
				<div className={playing ? 'videoArea' : 'videoArea hide'}>
					<ReactPlayer
						url={`${publicUrl}/assets/macho-madness-ooh-yeah.mp4`}
						playing={playing}
						onEnded={() => setPlaying(false)}
					/>
				</div>
			</div>
			<div className="screen lowerRight">
				<div className="alertText">hello4</div>
				<div className={playing ? 'videoArea' : 'videoArea hide'}>
					<ReactPlayer
						url={`${publicUrl}/assets/macho-madness-ooh-yeah.mp4`}
						playing={playing}
						onEnded={() => setPlaying(false)}
					/>
				</div>
			</div>
		</div>
	);
};

export default VideoAlerts;
