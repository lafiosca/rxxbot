import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { MessageEvent } from 'rxxbot-types';
import { useMessageListener } from '../hooks/useMessageListener';
import '../App.css';

const assetsUrl = `${process.env.PUBLIC_URL}/assets`;

const VideoAlerts = () => {
	const [alertVideo, setAlertVideo] = useState<string | null>(null);
	const [alertMessage, setAlertMessage] = useState<JSX.Element | null>(null);
	const [playing, setPlaying] = useState(false);
	useMessageListener(
		{
			fromModuleId: 'TwitchAlerts',
			messageType: 'videoAlert',
		},
		(event: MessageEvent) => {
			console.log(`Received server message event: ${JSON.stringify(event, null, 2)}`);
			if (playing) {
				console.log('Video already playing!');
			} else {
				const video = event.message.video;
				console.log(`Start video ${video}`);
				setAlertVideo(video);
				setPlaying(true);
				setAlertMessage((
					<React.Fragment>
						{event.message.message}
					</React.Fragment>
				));
			}
		},
		[
			alertVideo,
			setAlertVideo,
			playing,
			setPlaying,
			alertMessage,
			setAlertMessage,
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
							{alertMessage}
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
							url={`${assetsUrl}/${alertVideo}`}
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
