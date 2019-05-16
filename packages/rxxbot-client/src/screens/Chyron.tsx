import React, { useState, useEffect } from 'react';
import { MessageEvent, ChyronMessageType, ChyronConfig } from 'rxxbot-types';
import lodash from 'lodash';
import { useMessageListener } from '../hooks/useMessageListener';
import { useInterval } from '../hooks/useInterval';
import '../App.css';
import { getMessageSender } from '../services/socketIo';

export interface ChyronScreenConfig {
	screenId: string;
	fromModuleId?: string;
}

const chyronWidth = 10;

const defaultScreenConfig = {
	screenId: 'Chyron',
};

const defaultConfig: ChyronConfig = {
	crawlDelay: 2000,
	crawlMessages: [
		'@rxxbot chyron initializing',
		'Created by @lafiosca',
	],
};

interface CrawlState {
	crawl: {
		char: string;
		className: string;
	}[];
	lastMessage: string | null;
}

interface Props {
	screenConfig?: Partial<ChyronScreenConfig>;
}

const renderCrawlMessage = (message: string) => {
	const crawl: CrawlState['crawl'] = [];
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
	const crawl: CrawlState['crawl'] = [];
	for (let i = 0; i < chyronWidth; i += 1) {
		crawl.push({ char: ' ', className: 'regular' });
	}
	return crawl;
};

const Chyron = (props: Props) => {
	const screenConfig = {
		...defaultScreenConfig,
		...(props.screenConfig || {}),
	};

	const sendMessage = getMessageSender(screenConfig.screenId);

	const [config, setConfig] = useState<ChyronConfig>(defaultConfig);
	const [crawlState, setCrawlState] = useState<CrawlState>({
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
			const configUpdate = event.message.config as Partial<ChyronConfig>;
			setConfig({
				crawlDelay: configUpdate.crawlDelay || defaultConfig.crawlDelay,
				crawlMessages: (configUpdate.crawlMessages && configUpdate.crawlMessages.length > 0)
					? configUpdate.crawlMessages
					: defaultConfig.crawlMessages,
			});
		},
		[setConfig],
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
			console.log(`received queueCrawlMessage: ${event.message.crawlMessage}`);
			const newState = {
				...crawlState,
				crawl: [
					...crawlState.crawl,
					...renderCrawlMessage(event.message.crawlMessage),
				],
			};
			console.log(`update crawl: ${newState.crawl.map((x) => x.char).join('')}`);
			setCrawlState(newState);
		},
		[setCrawlState, crawlState.crawl.length],
	);

	useInterval(
		() => {
			let { crawl, lastMessage } = crawlState;
			crawl = crawl.slice(1);
			while (crawl.length < chyronWidth) {
				let tries = 0;
				let nextMessage: string;
				do {
					nextMessage = lodash.sample(config.crawlMessages)!;
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
			console.log(`update crawl: ${crawl.map((x) => x.char).join('')}`);
			setCrawlState({
				crawl,
				lastMessage,
			});
		},
		config.crawlDelay,
		[config.crawlMessages, crawlState.crawl.length, setCrawlState],
	);

	const { crawl } = crawlState;

	return (
		<div className="screen">
			<div className="screenRow"></div>
			<div className="screenRow"></div>
			<div className="screenRow bottom">
				{crawl && (
					<div className="chyronCrawl">
						{crawl.slice(0, chyronWidth)
							.map(({ char, className }, i) => (
								<div key={i} className={className}>{char}</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Chyron;
