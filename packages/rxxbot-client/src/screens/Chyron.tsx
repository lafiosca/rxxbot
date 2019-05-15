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

const defaultScreenConfig = {
	screenId: 'Chyron',
};

const defaultConfig: ChyronConfig = {
	crawlDelay: 250,
	crawlMessages: [
		'@rxxbot chyron initializing',
		'Created by @lafiosca',
	],
};

interface CrawlState {
	upcoming: string[];
	offset: number;
	crawl: JSX.Element | null;
}

interface Props {
	screenConfig?: Partial<ChyronScreenConfig>;
}

const Chyron = (props: Props) => {
	const screenConfig = {
		...defaultScreenConfig,
		...(props.screenConfig || {}),
	};

	const sendMessage = getMessageSender(screenConfig.screenId);

	const [config, setConfig] = useState<ChyronConfig>(defaultConfig);
	const [crawlState, setCrawlState] = useState<CrawlState>({
		upcoming: [],
		offset: 0,
		crawl: null,
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
			setCrawlState({
				...crawlState,
				upcoming: [
					...crawlState.upcoming,
					event.message.crawlMessage,
				],
			});
		},
		[setCrawlState, crawlState],
	);

	useInterval(
		() => {
			const upcoming = [...crawlState.upcoming];
			let { offset } = crawlState;
			if (upcoming.length > 0 && offset === upcoming[0].length + 5) {
				offset = 0;
				upcoming.shift();
			}
			const parts: JSX.Element[] = [];
			let charCount = 0;
			let upcomingIndex = 0;
			let offsetRemaining = offset;
			while (charCount < 80) {
				let next: string;
				if (upcoming.length === upcomingIndex) {
					let tries = 0;
					do {
						next = lodash.sample(config.crawlMessages)!;
						tries += 1;
					} while (
						upcomingIndex > 0
						&& next === upcoming[upcomingIndex - 1]
						&& config.crawlMessages.length > 1
						&& tries < 9);
					upcoming.push(next);
				} else {
					next = upcoming[upcomingIndex];
				}
				const words = [
					...next.split(' '),
					null, // message separator
				];
				words.forEach((word) => {
					const aword = `${word || '***'} `;
					const text = aword.substr(offsetRemaining, 80 - charCount);
					offsetRemaining = Math.max(0, offsetRemaining - aword.length);
					if (text) {
						const className = (word === null)
							? 'separator'
							: (word[0] === '@' ? 'highlight' : 'regular');
						parts.push(<div className={className} key={charCount}>{text}</div>);
						charCount += text.length;
					}
				});
				upcomingIndex += 1;
			}
			setCrawlState({
				upcoming,
				offset: offset + 1,
				crawl: (
					<React.Fragment>
						{parts}
					</React.Fragment>
				),
			});
		},
		config.crawlDelay,
		[config.crawlMessages, crawlState, setCrawlState],
	);

	const { crawl } = crawlState;

	return (
		<div className="screen">
			<div className="screenRow"></div>
			<div className="screenRow"></div>
			<div className="screenRow bottom">
				{crawl && (
					<div className="chyronCrawl">
						{crawl}
					</div>
				)}
			</div>
		</div>
	);
};

export default Chyron;
