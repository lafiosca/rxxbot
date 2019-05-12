import React, { useState, useEffect } from 'react';
import { MessageEvent, ChyronMessageType, ChyronConfig } from 'rxxbot-types';
import { useMessageListener } from '../hooks/useMessageListener';
import { useInterval } from '../hooks/useInterval';
import '../App.css';

export interface ChyronScreenConfig {
	screenId: string;
	fromModuleId?: string;
}

const defaultScreenConfig = {
	screenId: 'Chyron',
};

const defaultCrawlDelay = 200;

interface Props {
	screenConfig?: Partial<ChyronScreenConfig>;
}

const renderCrawl = (text: string) => {
	return (
		<React.Fragment>
			{text}
		</React.Fragment>
	);
};

const Chyron = (props: Props) => {
	const screenConfig = {
		...defaultScreenConfig,
		...(props.screenConfig || {}),
	};

	const [config, setConfig] = useState<ChyronConfig | null>(null);
	const [crawlIndex, setCrawlIndex] = useState(0);
	const [crawlOffset, setCrawlOffset] = useState(0);
	const [crawl, setCrawl] = useState<JSX.Element | null>(null);

	useEffect(
		() => {
			// send requestConfig
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
			setConfig(event.message as ChyronConfig);
		},
		[setConfig],
	);

	useInterval(
		() => {
			console.log(`interval, crawlOffset = ${crawlOffset}`);
			let text = '';
			for (let i = 0; i < 80; i += 1) {
				const n = (i + crawlOffset) % 11;
				text = `${text}${(n === 10) ? '_' : n}`;
			}
			setCrawl(renderCrawl(text));
			setCrawlOffset(crawlOffset + 1);
		},
		config && config.crawlDelay || defaultCrawlDelay,
	);

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
