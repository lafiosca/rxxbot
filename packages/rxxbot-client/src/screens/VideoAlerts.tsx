import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { MessageEvent, VideoAlertsMessageType } from 'rxxbot-types';
import { useMessageListener } from '../hooks/useMessageListener';
import '../App.css';

const assetsUrl = `${process.env.PUBLIC_URL}/assets`;

export interface VideoAlertsConfig {
	screenId: string;
	fromModuleId?: string;
}

const defaultConfig = {
	screenId: 'VideoAlerts',
};

interface Props {
	config?: Partial<VideoAlertsConfig>;
}

const renderText = (text: string) => {
	if (!text) {
		return null;
	}
	return (
		<React.Fragment>
			{text}
		</React.Fragment>
	);
};

const VideoAlerts = (props: Props) => {
	const config = {
		...defaultConfig,
		...(props.config || {}),
	};
	const [alertVideo, setAlertVideo] = useState<string | null>(null);
	const [alertText, setAlertText] = useState<JSX.Element | null>(null);
	const [playing, setPlaying] = useState(false);
	useMessageListener(
		{
			messageType: VideoAlertsMessageType.ShowAlert,
			fromModuleId: config.fromModuleId,
			message: {
				screenId: config.screenId,
			},
		},
		(event: MessageEvent) => {
			console.log(`Received server message event: ${JSON.stringify(event, null, 2)}`);
			if (playing) {
				console.log('Video already playing!');
			} else {
				const { video, text } = event.message;
				console.log(`Start video ${video}`);
				setAlertVideo(video);
				setAlertText(renderText(text));
				setPlaying(true);
			}
		},
		[
			alertVideo,
			setAlertVideo,
			playing,
			setPlaying,
			alertText,
			setAlertText,
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
						<div className={(playing && alertText) ? 'alertText' : 'alertText hide'}>
							{alertText}
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
