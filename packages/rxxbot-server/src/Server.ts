import {
	ServerConfig,
	StorageModule,
	ModuleSpecConfig,
	ServerEventType,
	ServerEvent,
	ServerApi,
	ModuleSpec,
	ModuleSpecMap,
	ModuleApiMap,
	ModuleApi,
	MessageEvent,
} from 'rxxbot-types';

class Server {
	protected readonly moduleSpecs: ModuleSpec[] = [];
	protected readonly moduleSpecsById: ModuleSpecMap = {};
	protected readonly moduleApiById: ModuleApiMap = {};

	constructor(config: ServerConfig) {
		this.normalizeModuleSpecs(config.modules);
	}

	protected normalizeModuleSpecs = (moduleSpecConfigs: ModuleSpecConfig[]) => {
		moduleSpecConfigs.forEach((config) => {
			let moduleSpec: ModuleSpec;
			if ('module' in config) {
				moduleSpec = {
					id: config.id
						|| config.module.getDefaultModuleId()
						|| config.module.constructor.name,
					type: config.type
						|| config.module.getDefaultModuleType()
						|| 'basic',
					module: config.module,
					privileged: config.privileged || false,
				};
			} else {
				moduleSpec = {
					id: config.getDefaultModuleId()
						|| config.constructor.name,
					type: config.getDefaultModuleType()
						|| 'basic',
					module: config,
					privileged: false,
				};
			}
			this.moduleSpecs.push(moduleSpec);
		});
		this.moduleSpecs.forEach((moduleSpec) => {
			if (this.moduleSpecsById[moduleSpec.id]) {
				throw new Error(`Each module must have a unique id; found duplicate '${moduleSpec.id}'`);
			}
			this.moduleSpecsById[moduleSpec.id] = moduleSpec;
		});
	}

	protected moduleMap = <T>(mapping: (moduleSpec: ModuleSpec, index: number) => (Promise<T> | T)) =>
		Promise.all(this.moduleSpecs.map(mapping))

	protected sendEvent = async (event: ServerEvent) => {
		await this.moduleMap((moduleSpec) => moduleSpec.module.onEvent(event));
	}

	protected sendMessage = (messageArgs: Pick<MessageEvent, Exclude<keyof MessageEvent, 'type'>>) =>
		this.sendEvent({
			type: ServerEventType.Message,
			...messageArgs,
		})

	protected store = async (moduleId: string, key: string, value: string) => {
		await this.moduleMap((moduleSpec) => {
			if (moduleSpec.type === 'storage') {
				return (moduleSpec.module as StorageModule).store(moduleId, key, value);
			}
		});
	}

	protected fetch = async (moduleId: string, key: string) => {
		let fetchIndex: number | null = null;
		const results = await this.moduleMap((moduleSpec, index) => {
			if (fetchIndex === null && moduleSpec.type === 'storage') {
				fetchIndex = index;
				return (moduleSpec.module as StorageModule).fetch(moduleId, key);
			}
			return null;
		});
		return fetchIndex !== null
			? results[fetchIndex]
			: null;
	}

	protected remove = async (moduleId: string, key: string) => {
		await this.moduleMap((moduleSpec) => {
			if (moduleSpec.type === 'storage') {
				return (moduleSpec.module as StorageModule).remove(moduleId, key);
			}
		});
	}

	protected getModuleApi = <T extends ModuleApi = ModuleApi>(moduleId: string): T | null =>
		this.moduleApiById[moduleId]
			? this.moduleApiById[moduleId] as T
			: null

	protected heartbeat = () =>
		this.sendEvent({ type: ServerEventType.Heartbeat })

	protected buildApiForModule = (moduleSpec: ModuleSpec) => {
		const api: ServerApi = {
			sendMessage: (messageType: string, message: any) =>
				this.sendMessage({
					messageType,
					message,
					fromModuleId: moduleSpec.id,
				}),
			store: <T = any>(key: string, value: T) =>
				this.store(moduleSpec.id, key, JSON.stringify(value)),
			fetch: async <T = any>(key: string): Promise<T | null> => {
				const value = await this.fetch(moduleSpec.id, key);
				return value && JSON.parse(value);
			},
			remove: (key: string) => this.remove(moduleSpec.id, key),
		};
		if (moduleSpec.privileged) {
			api.heartbeat = this.heartbeat;
			api.sendMessageFromScreen = (fromScreenId: string, messageType: string, message: any) =>
				this.sendMessage({
					fromScreenId,
					messageType,
					message,
				});
		}
		return api;
	}

	public run = async () => {
		// TODO: check for module init failures, gracefully clean up and exit
		const moduleApis = await this.moduleMap((moduleSpec) =>
			moduleSpec.module.initWithApi(
				this.buildApiForModule(moduleSpec),
			));
		await this.moduleMap((moduleSpec, i) => {
			const moduleApi = moduleApis[i];
			if (moduleApi) {
				this.moduleApiById[moduleSpec.id] = moduleApi;
			}
		});
		await this.sendEvent({ type: ServerEventType.InitComplete });
	}
}

export default Server;
