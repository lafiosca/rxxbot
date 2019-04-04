import { ModuleType, StorageModule } from 'rxxbot-types';
import AbstractConfigurableModule from './AbstractConfigurableModule';

abstract class AbstractStorageModule<T> extends AbstractConfigurableModule<T>
	implements StorageModule {
	public getDefaultModuleType = (): ModuleType => 'storage';
	public abstract store: (moduleId: string, key: string, value: string) => Promise<void>;
	public abstract fetch: (moduleId: string, key: string) => Promise<string | null>;
	public abstract remove: (moduleId: string, key: string) => Promise<void>;
}

export default AbstractStorageModule;
