import { ServerEvent, ServerEventType, MessageEvent } from 'rxxbot-types';
import AbstractConfigurableModule from './AbstractConfigurableModule';

export interface ConsoleLoggerConfig {}

class ConsoleLogger extends AbstractConfigurableModule<ConsoleLoggerConfig> {
	constructor(config: ConsoleLoggerConfig = {}) {
		super(config);
	}

	private superOnEvent: (event: ServerEvent) => Promise<void> = this.onEvent;

	protected init = async () => {
		console.log('Initializing console logger');
	}

	public onEvent = async (event: ServerEvent) => {
		if (event.type !== ServerEventType.Message) {
			console.log(`Server event: ${JSON.stringify(event)}`);
		}
		return this.superOnEvent(event);
	}

	protected onMessage = async ({
		fromModuleId,
		fromScreenId,
		messageType,
		message,
	}: MessageEvent) => {
		console.log(
			`Message from ${fromModuleId ? `module ${fromModuleId}` : `screen ${fromScreenId}`}, `
				+ `type '${messageType}': ${JSON.stringify(message, null, 2)}`,
		);
	}
}

export default ConsoleLogger;
