import { ModuleType } from '../types';
import ConfigurableServerModule from './ConfigurableServerModule';

abstract class StorageModule<T> extends ConfigurableServerModule<T> {
	public getDefaultModuleType = (): ModuleType => 'storage';
	public abstract store: (moduleId: string, key: string, value: string) => Promise<void>;
	public abstract fetch: (moduleId: string, key: string) => Promise<string | null>;
	public abstract remove: (moduleId: string, key: string) => Promise<void>;
}

export default StorageModule;
