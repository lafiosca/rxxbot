import ConfigurableServerModule from './ConfigurableServerModule';

interface ConsoleLoggerConfig {
}

class ConsoleLogger extends ConfigurableServerModule<ConsoleLoggerConfig> {
	constructor(config: ConsoleLoggerConfig = {}) {
		super(config);
	}

	protected init = async () => {
		console.log('Initializing console logger');
	}

	public onEvent = async (event: any) => {
		console.log(`Server event: ${JSON.stringify(event)}`);
	}
}

export default ConsoleLogger;
