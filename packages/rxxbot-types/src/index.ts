export type ModuleType = 'basic' | 'storage';

export interface ModuleApi {
	[method: string]: (...args: any[]) => any;
}

export interface ServerModule {
	getDefaultModuleId: () => string;
	getDefaultModuleType: () => ModuleType;
	initWithApi: (api: ServerApi) => Promise<ModuleApi | void>;
	onEvent: (event: ServerEvent) => Promise<void>;
}

export interface BasicModule extends ServerModule {}

export interface StorageModule extends ServerModule {
	store: (moduleId: string, key: string, value: string) => Promise<void>;
	fetch: (moduleId: string, key: string) => Promise<string | null>;
	remove: (moduleId: string, key: string) => Promise<void>;
}

export interface ModuleSpec {
	id: string;
	type: ModuleType;
	module: ServerModule;
	privileged: boolean;
}

export interface ModuleSpecMap {
	[id: string]: ModuleSpec;
}

export interface ModuleConfig {
	[key: string]: any;
}

export interface ModuleApiMap {
	[id: string]: ModuleApi;
}

export interface StorageModuleSpecConfig extends Partial<ModuleSpec> {
	type: 'storage';
	module: StorageModule;
}

export interface ServerModuleSpecConfig extends Partial<ModuleSpec> {
	type?: 'basic';
	module: ServerModule;
}

export type ModuleSpecConfig = ServerModule
	| StorageModuleSpecConfig
	| ServerModuleSpecConfig;

export type ServerConfig = {
	modules: ModuleSpecConfig[];
};

export enum ServerEventType {
	InitComplete = 'initComplete',
	Message = 'message',
	Heartbeat = 'heartbeat',
}

export interface InitCompleteEvent {
	type: ServerEventType.InitComplete;
}

export interface MessageEvent {
	type: ServerEventType.Message;
	fromModuleId: string;
	messageType: string;
	message: any;
}

export interface HeartbeatEvent {
	type: ServerEventType.Heartbeat;
}

export type ServerEvent = InitCompleteEvent | MessageEvent | HeartbeatEvent;

export interface ServerApi {
	sendMessage: (messageType: string, message: any) => Promise<void>;
	store: (key: string, value: string) => Promise<void>;
	fetch: (key: string) => Promise<string | null>;
	remove: (key: string) => Promise<void>;
	heartbeat?: () => Promise<void>;
}
