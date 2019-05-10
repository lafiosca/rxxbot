import {
	TwitchAlertsConfig,
	TwitchMessageType,
	ExtractTwitchMessage,
} from 'rxxbot-types';
import lodash from 'lodash';

import AbstractConfigurableModule from './AbstractConfigurableModule';

const videos = [
	'macho-madness-ooh-yeah.mp4',
	'bill-cipher-buy-gold.mp4',
	'brent-rambo.mp4',
];

class TwitchAlerts extends AbstractConfigurableModule<TwitchAlertsConfig> {
	constructor(config: Partial<TwitchAlertsConfig> = {}) {
		super({
			twitchModuleId: 'Twitch',
			...config,
		});
	}

	protected handleTwitchMessage = <T extends TwitchMessageType>(
		messageType: T,
		message: ExtractTwitchMessage<T>,
	) => {
		switch (messageType) {
			case TwitchMessageType.Chat: {
				const chatMessage = message as ExtractTwitchMessage<TwitchMessageType.Chat>;
				this.api!.sendMessage(
					'videoAlert',
					{
						message: `Incoming chat message from ${chatMessage.user}`,
						video: lodash.sample(videos),
					},
				);
				break;
			}
		}
	}

	protected onMessage = async (fromModuleId: string, messageType: string, message: any) => {
		if (fromModuleId !== this.config.twitchModuleId) {
			return;
		}
		return this.handleTwitchMessage(
			messageType as TwitchMessageType,
			message,
		);
	}
}

export default TwitchAlerts;
