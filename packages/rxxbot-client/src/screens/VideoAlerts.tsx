import React, { useReducer } from 'react';
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

interface AlertTextChar {
	char: string;
	className: string;
}

interface State {
	alertVideo: string | null;
	alertText: AlertTextChar[] | null;
	queue: {
		alertVideo: string;
		alertText: AlertTextChar[] | null;
	}[];
	playing: boolean;
}

enum ActionType {
	QueueVideo = 'queueVideo',
	EndPlayback = 'endPlayback',
	PlayQueuedVideo = 'playQueuedVideo',
}

interface QueueVideoAction {
	type: ActionType.QueueVideo;
	payload: {
		video: string;
		text: string;
	};
}

interface EndPlaybackAction {
	type: ActionType.EndPlayback;
}

interface PlayQueuedVideoAction {
	type: ActionType.PlayQueuedVideo;
}

type Action = QueueVideoAction | EndPlaybackAction | PlayQueuedVideoAction;

const renderText = (text: string) => {
	if (!text) {
		return null;
	}
	const rendered: AlertTextChar[] = [];
	const words = text.split(' ');
	words.forEach((word) => {
		Array.from(word).forEach((char) => {
			rendered.push({
				char,
				className: word[0] === '@' ? 'highlight' : 'regular',
			});
		});
		rendered.push({ char: ' ', className: 'regular' });
	});
	return rendered;
};

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case ActionType.QueueVideo: {
			const { video, text } = action.payload;
			if (state.playing || state.queue.length > 0) {
				return {
					...state,
					queue: [
						...state.queue,
						{
							alertVideo: video,
							alertText: renderText(text),
						},
					],
				};
			}
			return {
				...state,
				alertVideo: video,
				alertText: renderText(text),
				playing: true,
			};
		}
		case ActionType.EndPlayback: {
			return {
				...state,
				playing: false,
			};
		}
		case ActionType.PlayQueuedVideo: {
			if (state.playing || state.queue.length === 0) {
				return state;
			}
			return {
				...state.queue[0],
				queue: state.queue.slice(1),
				playing: true,
			};
		}
		default:
			return state;
	}
};

const VideoAlerts = (props: Props) => {
	const config = {
		...defaultConfig,
		...(props.config || {}),
	};

	const [state, dispatch] = useReducer(reducer, {
		alertVideo: null,
		alertText: null,
		queue: [],
		playing: false,
	});

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
			const { video, text } = event.message;
			dispatch({
				type: ActionType.QueueVideo,
				payload: { video, text },
			});
		},
		[dispatch],
	);

	const { alertVideo, alertText, playing } = state;

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
							{alertText && alertText.map(({ char, className }, i) => (
								<div key={i} className={className}>{char}</div>
							))}
						</div>
					</div>
				</div>
				<div className="screenCell vcenter hcenter"></div>
				<div className="screenCell vcenter right"></div>
			</div>
			<div className="screenRow">
				<div className="screenCell bottom left">
					<div className={playing ? 'videoCell' : 'videoCell hide'}>
						{alertVideo && (
							<ReactPlayer
								width="100%"
								height="100%"
								url={`${assetsUrl}/${alertVideo}`}
								playing={playing}
								onEnded={() => {
									dispatch({ type: ActionType.EndPlayback });
									setTimeout(
										() => dispatch({ type: ActionType.PlayQueuedVideo }),
										1000,
									);
								}}
								volume={0.1}
							/>
						)}
					</div>
				</div>
				<div className="screenCell bottom hcenter"></div>
				<div className="screenCell bottom right"></div>
			</div>
		</div>
	);
};

export default VideoAlerts;
