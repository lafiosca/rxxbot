import ServerModule from './modules/ServerModule';

export interface FullModuleSpec {
	module: ServerModule;
}

export type ModuleSpec = ServerModule | FullModuleSpec;

export type ServerConfig = {
	modules: ModuleSpec[];
};

export enum ServerEventType {
	InitComplete = 'initComplete',
	Heartbeat = 'heartbeat',
}

export interface ServerEvent {
	type: ServerEventType;
}

export interface ServerModuleConfig {
	[key: string]: any;
}
