import AbstractBasicModule from './AbstractBasicModule';

abstract class AbstractConfigurableModule<T> extends AbstractBasicModule {
	protected readonly config: T;

	constructor(config: T) {
		super();
		this.config = config;
	}
}

export default AbstractConfigurableModule;
