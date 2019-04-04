import { ServerEvent } from 'rxxbot-types';
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
		console.log(`Server event: ${JSON.stringify(event)}`);
		return this.superOnEvent(event);
	}
}

export default ConsoleLogger;
