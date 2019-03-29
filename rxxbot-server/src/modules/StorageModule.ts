import ConfigurableServerModule from './ConfigurableServerModule';

abstract class StorageModule<T> extends ConfigurableServerModule<T> {
	abstract store: (moduleId: string, key: string, value: string) => Promise<void>;
	abstract fetch: (moduleId: string, key: string) => Promise<string | null>;
	abstract remove: (moduleId: string, key: String) => Promise<void>;
}

export default StorageModule;
