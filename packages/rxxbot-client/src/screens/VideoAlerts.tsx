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

interface AlertText {
	text: string;
	className: string;
}

interface State {
	alertVideo: string | null;
	alertText: AlertText[] | null;
	alertCredit: string | null;
	queue: {
		alertVideo: string;
		alertText: AlertText[] | null;
		alertCredit: string | null;
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
		text?: string;
		credit?: string;
	};
}

interface EndPlaybackAction {
	type: ActionType.EndPlayback;
}

interface PlayQueuedVideoAction {
	type: ActionType.PlayQueuedVideo;
}

type Action = QueueVideoAction | EndPlaybackAction | PlayQueuedVideoAction;

const renderText = (text: string | undefined) => {
	if (!text) {
		return null;
	}
	const rendered: AlertText[] = [];
	const words = text.split(' ');
	words.forEach((word) => {
		rendered.push({
			text: `${word} `,
			className: word[0] === '@' ? 'highlight' : 'regular',
		});
	});
	return rendered;
};

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case ActionType.QueueVideo: {
			const { video, text, credit } = action.payload;
			if (state.playing || state.queue.length > 0) {
				return {
					...state,
					queue: [
						...state.queue,
						{
							alertVideo: video,
							alertText: renderText(text),
							alertCredit: credit || null,
						},
					],
				};
			}
			return {
				...state,
				alertVideo: video,
				alertText: renderText(text),
				alertCredit: credit || null,
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
		alertCredit: null,
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
			const { video, text, credit } = event.message;
			dispatch({
				type: ActionType.QueueVideo,
				payload: { video, text, credit },
			});
		},
		[dispatch],
	);

	const {
		alertVideo,
		alertText,
		alertCredit,
		playing,
	} = state;

	return (
		<div className="screen">
			<div className="videoAlert">
				{alertText && (
					<div className={playing ? 'videoAlertText' : 'videoAlertText hide'}>
						{alertText && alertText.map(({ text, className }, i) => (
							<div key={i} className={className}>{text}</div>
						))}
					</div>
				)}
				<div className={playing ? 'videoAlertVideo' : 'videoAlertVideo hide'}>
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
				{alertCredit && (
					<div className={playing ? 'videoAlertCredit' : 'videoAlertCredit hide'}>
						{alertCredit}
					</div>
				)}
			</div>
		</div>
	);
};

export default VideoAlerts;
