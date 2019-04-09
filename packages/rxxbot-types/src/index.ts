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

export interface TwitchConfig {
	credentials: {
		clientId: string;
		clientSecret: string;
		refreshToken: string;
	};
	channels: string[];
}

export enum TwitchMessageType {
	BitsBadgeUpgrade = 'bitsBadgeUpgrade',
	Chat = 'chat',
	ChatClear = 'chatClear',
	Cheer = 'cheer',
	CommunitySub = 'communitySub',
	EmoteOnly = 'emoteOnly',
	FollowersOnly = 'followersOnly',
	Host = 'host',
	Hosted = 'hosted',
	HostsRemaining = 'hostsRemaining',
	Join = 'join',
	NewChatter = 'newChatter',
	Part = 'part',
	R9k = 'r9k',
	Raid = 'raid',
	Resub = 'resub',
	Ritual = 'ritual',
	Slow = 'slow',
	Sub = 'sub',
	SubGift = 'subGift',
	SubsOnly = 'subsOnly',
	Timeout = 'timeout',
	Unhost = 'unhost',
	Whisper = 'whisper',
}

export interface TwitchMessageEventBitsBadgeUpgrade extends MessageEvent {
	messageType: TwitchMessageType.BitsBadgeUpgrade;
	message: {
		channel: string;
		user: string;
		displayName: string;
		threshold: number;
	};
}

export interface TwitchMessageEventChat extends MessageEvent {
	messageType: TwitchMessageType.Chat;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventChatClear extends MessageEvent {
	messageType: TwitchMessageType.ChatClear;
	message: {
		channel: string;
	};
}

export interface TwitchMessageEventCheer extends MessageEvent {
	messageType: TwitchMessageType.Cheer;
	message: {
		totalBits: number;
	};
}

export interface TwitchMessageEventCommunitySub extends MessageEvent {
	messageType: TwitchMessageType.CommunitySub;
	message: {
		channel: string;
		user: string;
		count: number;
		plan: string;
		gifter?: string;
		gifterDisplayName?: string;
		gifterGiftCount?: number;
	};
}

export interface TwitchMessageEventEmoteOnly extends MessageEvent {
	messageType: TwitchMessageType.EmoteOnly;
	message: {
		channel: string;
		enabled: boolean;
	};
}

export interface TwitchMessageEventFollowersOnly extends MessageEvent {
	messageType: TwitchMessageType.FollowersOnly;
	message: {
		channel: string;
		enabled: boolean;
		delay?: number;
	};
}

export interface TwitchMessageEventHost extends MessageEvent {
	messageType: TwitchMessageType.Host;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventHosted extends MessageEvent {
	messageType: TwitchMessageType.Hosted;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventHostsRemaining extends MessageEvent {
	messageType: TwitchMessageType.HostsRemaining;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventJoin extends MessageEvent {
	messageType: TwitchMessageType.Join;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventNewChatter extends MessageEvent {
	messageType: TwitchMessageType.NewChatter;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventPart extends MessageEvent {
	messageType: TwitchMessageType.Part;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventR9k extends MessageEvent {
	messageType: TwitchMessageType.R9k;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventRaid extends MessageEvent {
	messageType: TwitchMessageType.Raid;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventResub extends MessageEvent {
	messageType: TwitchMessageType.Resub;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventRitual extends MessageEvent {
	messageType: TwitchMessageType.Ritual;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventSlow extends MessageEvent {
	messageType: TwitchMessageType.Slow;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventSub extends MessageEvent {
	messageType: TwitchMessageType.Sub;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventSubGift extends MessageEvent {
	messageType: TwitchMessageType.SubGift;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventSubsOnly extends MessageEvent {
	messageType: TwitchMessageType.SubsOnly;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventTimeout extends MessageEvent {
	messageType: TwitchMessageType.Timeout;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventUnhost extends MessageEvent {
	messageType: TwitchMessageType.Unhost;
	message: {
		x: number;
	};
}

export interface TwitchMessageEventWhisper extends MessageEvent {
	messageType: TwitchMessageType.Whisper;
	message: {
		x: number;
	};
}

export type TwitchMessageEvent = TwitchMessageEventBitsBadgeUpgrade
	| TwitchMessageEventChat
	| TwitchMessageEventChatClear
	| TwitchMessageEventCheer
	| TwitchMessageEventCommunitySub
	| TwitchMessageEventEmoteOnly
	| TwitchMessageEventFollowersOnly
	| TwitchMessageEventHost
	| TwitchMessageEventHosted
	| TwitchMessageEventHostsRemaining
	| TwitchMessageEventJoin
	| TwitchMessageEventNewChatter
	| TwitchMessageEventPart
	| TwitchMessageEventR9k
	| TwitchMessageEventRaid
	| TwitchMessageEventResub
	| TwitchMessageEventRitual
	| TwitchMessageEventSlow
	| TwitchMessageEventSub
	| TwitchMessageEventSubGift
	| TwitchMessageEventSubsOnly
	| TwitchMessageEventTimeout
	| TwitchMessageEventUnhost
	| TwitchMessageEventWhisper;
