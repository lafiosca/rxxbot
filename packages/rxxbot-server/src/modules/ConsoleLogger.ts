import ConfigurableServerModule from './ConfigurableServerModule';
import { ServerEvent } from '../types';

export interface ConsoleLoggerConfig {}

class ConsoleLogger extends ConfigurableServerModule<ConsoleLoggerConfig> {
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
