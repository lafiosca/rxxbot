import {
	TwitchAlertsConfig,
	VideoAlertsMessageType,
	isTwitchAlertCallbackConfig,
	MessageEvent,
	ChyronMessageType,
} from 'rxxbot-types';
import lodash from 'lodash';

import AbstractConfigurableModule from './AbstractConfigurableModule';

const defaultConfig: TwitchAlertsConfig = {
	twitchModuleId: 'Twitch',
	videoAlertsScreenId: 'VideoAlerts',
	chyronScreenId: 'Chyron',
	alerts: [],
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
			if (messageType !== alert.type) {
				continue;
			}
			const alertConfig = isTwitchAlertCallbackConfig(alert)
				? alert.callback(message)
				: alert;
			if (!alertConfig) {
				continue;
			}
			const videoPick = lodash.sample(alertConfig.videos);
			if (!videoPick) {
				continue;
			}
			let video: string | undefined;
			let template: string | null | undefined;
			if (typeof videoPick === 'string') {
				video = videoPick;
			} else {
				video = videoPick.video;
				if (videoPick.templates) {
					template = lodash.sample(videoPick.templates);
				} else {
					template = videoPick.templates; // null or undefined
				}
			}
			if (template === undefined && alertConfig.templates) {
				template = lodash.sample(alertConfig.templates);
			}
			const text = template ? this.renderText(template, message) : undefined;
			return this.api!.sendMessage(
				VideoAlertsMessageType.ShowAlert,
				{
					video,
					text,
					screenId: this.config.videoAlertsScreenId,
				},
			);
		}
	}

	protected onChyronMessage = async ({ messageType }: MessageEvent) => {
		if (messageType === ChyronMessageType.RequestConfig) {
			this.api!.sendMessage(
				ChyronMessageType.SetConfig,
				{
					screenId: this.config.chyronScreenId,
					config: {
						crawlMessages: [
							'test message #23',
							'fnord!',
							'imposition of order = escalation of chaos',
							'@rxxbot created by @lafiosca',
						],
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
