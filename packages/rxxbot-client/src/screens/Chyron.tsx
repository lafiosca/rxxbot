import React, { useReducer, useEffect } from 'react';
import { MessageEvent, ChyronMessageType, ChyronConfig } from 'rxxbot-types';
import lodash from 'lodash';
import { useMessageListener } from '../hooks/useMessageListener';
import { useInterval } from '../hooks/useInterval';
import { getMessageSender } from '../services/socketIo';
import '../App.css';

export interface ChyronScreenConfig {
	screenId: string;
	fromModuleId?: string;
}

const chyronWidth = 80;

const defaultScreenConfig = {
	screenId: 'Chyron',
};

const defaultConfig: ChyronConfig = {
	crawlDelay: 200,
	crawlMessages: [
		'@rxxbot chyron initializing',
		'Created by @lafiosca',
	],
};

interface Props {
	screenConfig?: Partial<ChyronScreenConfig>;
}

interface State {
	config: ChyronConfig;
	crawl: {
		char: string;
		className: string;
	}[];
	lastMessage: string | null;
}

enum ActionType {
	SetConfig = 'setConfig',
	UpdateCrawl = 'updateCrawl',
	QueueCrawlMessage = 'queueCrawlMessage',
}

interface SetConfigAction {
	type: ActionType.SetConfig;
	payload: {
		config: Partial<ChyronConfig>;
	};
}

interface UpdateCrawlAction {
	type: ActionType.UpdateCrawl;
}

interface QueueCrawlMessageAction {
	type: ActionType.QueueCrawlMessage;
	payload: {
		crawlMessage: string;
	};
}

type Action = SetConfigAction | UpdateCrawlAction | QueueCrawlMessageAction;

const renderCrawlMessage = (message: string) => {
	const crawl: State['crawl'] = [];
	const words = message.split(' ');
	words.forEach((word) => {
		Array.from(word).forEach((char) => {
			crawl.push({
				char,
				className: word[0] === '@' ? 'highlight' : 'regular',
			});
		});
		crawl.push({ char: ' ', className: 'regular' });
	});
	crawl.push({ char: '*', className: 'separator' });
	crawl.push({ char: '*', className: 'separator' });
	crawl.push({ char: '*', className: 'separator' });
	crawl.push({ char: ' ', className: 'regular' });
	return crawl;
};

const initializeCrawl = () => {
	const crawl: State['crawl'] = [];
	for (let i = 0; i < chyronWidth; i += 1) {
		crawl.push({ char: ' ', className: 'regular' });
	}
	return crawl;
};

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case ActionType.SetConfig: {
			const { config } = action.payload;
			return {
				...state,
				config: {
					crawlDelay: config.crawlDelay || state.config.crawlDelay,
					crawlMessages: (config.crawlMessages && config.crawlMessages.length > 0)
						? config.crawlMessages
						: state.config.crawlMessages,
				},
			};
		}
		case ActionType.UpdateCrawl: {
			const { config } = state;
			let crawl = state.crawl.slice(1);
			let lastMessage = state.lastMessage;
			while (crawl.length < chyronWidth) {
				let tries = 0;
				let nextMessage: string;
				do {
					nextMessage = lodash.sample(state.config.crawlMessages)!;
					tries += 1;
				} while (nextMessage === lastMessage
					&& config.crawlMessages.length > 1
					&& tries < 9);
				crawl = [
					...crawl,
					...renderCrawlMessage(nextMessage),
				];
				lastMessage = nextMessage;
			}
			return {
				...state,
				crawl,
				lastMessage,
			};
		}
		case ActionType.QueueCrawlMessage: {
			const { crawlMessage } = action.payload;
			return {
				...state,
				crawl: [
					...state.crawl,
					...renderCrawlMessage(crawlMessage),
				],
			};
		}
		default:
			return state;
	}
};

const Chyron = (props: Props) => {
	const screenConfig = {
		...defaultScreenConfig,
		...(props.screenConfig || {}),
	};

	const sendMessage = getMessageSender(screenConfig.screenId);

	const [state, dispatch] = useReducer(reducer, {
		config: defaultConfig,
		crawl: initializeCrawl(),
		lastMessage: null,
	});

	useEffect(
		() => {
			sendMessage(ChyronMessageType.RequestConfig);
		},
		[], // only fire off once
	);

	useMessageListener(
		{
			messageType: ChyronMessageType.SetConfig,
			fromModuleId: screenConfig.fromModuleId,
			message: {
				screenId: screenConfig.screenId,
			},
		},
		(event: MessageEvent) => {
			const config = event.message.config as Partial<ChyronConfig>;
			dispatch({
				type: ActionType.SetConfig,
				payload: { config },
			});
		},
		[dispatch],
	);

	useMessageListener(
		{
			messageType: ChyronMessageType.QueueCrawlMessage,
			fromModuleId: screenConfig.fromModuleId,
			message: {
				screenId: screenConfig.screenId,
			},
		},
		(event: MessageEvent) => {
			const { crawlMessage } = event.message;
			dispatch({
				type: ActionType.QueueCrawlMessage,
				payload: { crawlMessage },
			});
		},
		[dispatch],
	);

	useInterval(
		() => dispatch({ type: ActionType.UpdateCrawl }),
		state.config.crawlDelay,
		[dispatch],
	);

	const { crawl } = state;

	return (
		<div className="screen">
			{crawl && (
				<div className="chyronCrawl">
					{crawl.slice(0, chyronWidth)
						.map(({ char, className }, i) => (
							<div key={i} className={className}>{char}</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Chyron;
