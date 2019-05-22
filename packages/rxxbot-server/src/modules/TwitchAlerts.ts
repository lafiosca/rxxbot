import {
	TwitchAlertsConfig,
	VideoAlertsMessageType,
	isTwitchAlertCallbackConfig,
	MessageEvent,
	ChyronMessageType,
	TwitchMessageType,
} from 'rxxbot-types';
import lodash from 'lodash';

import AbstractConfigurableModule from './AbstractConfigurableModule';

const defaultConfig: TwitchAlertsConfig = {
	twitchModuleId: 'Twitch',
	videoAlertsScreenId: 'VideoAlerts',
	chyronScreenId: 'Chyron',
	alerts: [],
	crawlMessages: [
		'@rxxbot created by @lafiosca',
		'Test message #5',
		'Test message #23',
		'fnord',
		'imposition of order = escalation of chaos!',
		'Hail Eris! All hail Discordia!',
		'Praise "Bob"!',
	],
};

class TwitchAlerts extends AbstractConfigurableModule<TwitchAlertsConfig> {
	constructor(config: Partial<TwitchAlertsConfig> = {}) {
		super({
			...defaultConfig,
			...config,
		});
	}

	protected renderText = (template: string, message: any) =>
		template.replace(/{(\w+)}/g, (match, field) => message[field])

	protected onTwitchMessage = async ({ messageType, message }: MessageEvent) => {
		const { alerts, channel } = this.config;
		for (let i = 0; i < alerts.length; i += 1) {
			const alert = alerts[i];

			if (channel && message.channel && `#${channel}` !== message.channel) {
				continue;
			}

			if (lodash.isArray(alert.type)) {
				if (!lodash.includes(alert.type, messageType)) {
					continue;
				}
			} else if (messageType !== alert.type) {
				continue;
			}

			const alertConfig = isTwitchAlertCallbackConfig(alert)
				? alert.callback(message, messageType as TwitchMessageType)
				: alert;

			if (!alertConfig) {
				continue;
			}

			const videoPick = lodash.sample(alertConfig.videos);
			if (!videoPick) {
				continue;
			}

			let video: string | undefined;
			let credit: string | undefined;
			let captionTemplate: string | null | undefined;
			let crawlTemplate: string | null | undefined;
			if (typeof videoPick === 'string') {
				video = videoPick;
			} else {
				video = videoPick.video;
				credit = videoPick.credit;
				if (videoPick.captionTemplates) {
					captionTemplate = lodash.sample(videoPick.captionTemplates);
				} else {
					captionTemplate = videoPick.captionTemplates; // null or undefined
				}
				if (videoPick.crawlTemplates) {
					crawlTemplate = lodash.sample(videoPick.crawlTemplates);
				} else {
					crawlTemplate = videoPick.crawlTemplates; // null or undefined
				}
			}
			if (captionTemplate === undefined && alertConfig.captionTemplates) {
				captionTemplate = lodash.sample(alertConfig.captionTemplates);
			}
			if (crawlTemplate === undefined && alertConfig.crawlTemplates) {
				crawlTemplate = lodash.sample(alertConfig.crawlTemplates);
			}
			const text = captionTemplate ? this.renderText(captionTemplate, message) : undefined;
			const crawlMessage = crawlTemplate ? this.renderText(crawlTemplate, message) : undefined;
			this.api!.sendMessage(
				VideoAlertsMessageType.ShowAlert,
				{
					video,
					credit,
					text,
					screenId: this.config.videoAlertsScreenId,
				},
			);
			if (crawlMessage) {
				this.api!.sendMessage(
					ChyronMessageType.QueueCrawlMessage,
					{
						crawlMessage,
						screenId: this.config.chyronScreenId,
					},
				);
			}
			return;
		}
	}

	protected onChyronMessage = async ({ messageType }: MessageEvent) => {
		if (messageType === ChyronMessageType.RequestConfig) {
			this.api!.sendMessage(
				ChyronMessageType.SetConfig,
				{
					screenId: this.config.chyronScreenId,
					config: {
						crawlMessages: this.config.crawlMessages,
					},
				},
			);
		}
	}

	protected onMessage = async (event: MessageEvent) => {
		if (event.fromScreenId === this.config.chyronScreenId) {
			return this.onChyronMessage(event);
		}
		if (event.fromModuleId === this.config.twitchModuleId) {
			return this.onTwitchMessage(event);
		}
	}
}

export default TwitchAlerts;
