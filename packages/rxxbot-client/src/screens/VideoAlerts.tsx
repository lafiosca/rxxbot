import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
	addMessageListener,
	removeMessageListener,
} from '../services/socketIo';
import lodash from 'lodash';
import { MessageEvent } from 'rxxbot-types';
import '../App.css';

const assetsUrl = `${process.env.PUBLIC_URL}/assets`;
const videos = [
	'macho-madness-ooh-yeah.mp4',
	'bill-cipher-buy-gold.mp4',
	'brent-rambo.mp4',
];

const VideoAlerts = () => {
	const [currentVideo, setCurrentVideo] = useState<string | null>(null);
	const [playing, setPlaying] = useState(false);
	useEffect(
		() => {
			const listener = (event: MessageEvent) => {
				console.log(`Received server message event: ${JSON.stringify(event, null, 2)}`);
				if (event.messageType === 'cheer') {
					console.log(`Cheer from ${event.message.user}`);
				} else if (event.messageType === 'chat') {
					if (playing) {
						console.log('Video already playing!');
					} else {
						const video = lodash.sample(videos)!;
						console.log(`Start video ${video}`);
						setCurrentVideo(video);
						setPlaying(true);
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
		[
			currentVideo,
			setCurrentVideo,
			playing,
			setPlaying,
		],
	);
	return (
		<div className="screen">
			<div className="screenRow">
				<div className="screenCell top left"></div>
				<div className="screenCell top hcenter"></div>
				<div className="screenCell top right"></div>
			</div>
			<div className="screenRow">
				<div className="screenCell vcenter left">
					<div className="alertTextCell bottom left">
						<div className={playing ? 'alertText' : 'alertText hide'}>
							This is a video alert... With even more info.
						</div>
					</div>
				</div>
				<div className="screenCell vcenter hcenter"></div>
				<div className="screenCell vcenter right"></div>
			</div>
			<div className="screenRow">
				<div className="screenCell bottom left">
					<div className={playing ? 'videoCell' : 'videoCell hide'}>
						<ReactPlayer
							width="100%"
							height="100%"
							url={`${assetsUrl}/${currentVideo}`}
							playing={playing}
							onEnded={() => setPlaying(false)}
							volume={0.1}
						/>
					</div>
				</div>
				<div className="screenCell bottom hcenter"></div>
				<div className="screenCell bottom right"></div>
			</div>
		</div>
	);
};

export default VideoAlerts;
