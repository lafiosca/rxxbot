import StorageModule from './modules/StorageModule';
import ServerModule from './modules/ServerModule';

export type ModuleType = 'basic' | 'storage';

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

export interface ModuleApi {
	[method: string]: (...args: any[]) => any;
}

export interface ModuleApiMap {
	[id: string]: ModuleApi;
}

export interface StorageModuleSpecConfig extends Partial<ModuleSpec> {
	type: 'storage';
	module: StorageModule<any>;
}

export interface BasicModuleSpecConfig extends Partial<ModuleSpec> {
	type?: 'basic';
	module: ServerModule;
}

export type ModuleSpecConfig = ServerModule
	| StorageModuleSpecConfig
	| BasicModuleSpecConfig;

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
	message: any;
}

export interface HeartbeatEvent {
	type: ServerEventType.Heartbeat;
}

export type ServerEvent = InitCompleteEvent | MessageEvent | HeartbeatEvent;

export interface ServerApi {
	sendMessage: (message: string) => Promise<void>;
	store: (key: string, value: string) => Promise<void>;
	fetch: (key: string) => Promise<string | null>;
	remove: (key: string) => Promise<void>;
	heartbeat?: () => Promise<void>;
}
