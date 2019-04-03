import ServerModule from './ServerModule';

abstract class ConfigurableServerModule<T> extends ServerModule {
	protected readonly config: T;

	constructor(config: T) {
		super();
		this.config = config;
	}
}

export default ConfigurableServerModule;