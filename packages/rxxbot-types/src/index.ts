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

export interface TwitchConfig extends ModuleConfig {
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

export interface TwitchEmoteOffsets {
	[key: string]: string[];
}

export interface TwitchMessageEventMessageWithChannel {
	channel: string;
}

export interface TwitchMessageEventMessageWithUser {
	user: string;
}

export interface TwitchMessageEventMessageWithChannelUser
	extends TwitchMessageEventMessageWithChannel, TwitchMessageEventMessageWithUser {}

export interface TwitchMessageEventMessageWithMessage {
	message: string;
	emoteOffsets: TwitchEmoteOffsets;
}

export interface TwitchMessageEventMessageWithGifter {
	gifter: string;
	gifterDisplayName: string;
	gifterGiftCount: number;
}

export interface TwitchMessageEventChatMessageBase
	extends TwitchMessageEventMessageWithChannelUser, TwitchMessageEventMessageWithMessage {}

export interface TwitchMessageEventCommunitySubMessageBase
	extends TwitchMessageEventMessageWithChannelUser {
	count: number;
	plan: string;
}

export interface TwitchMessageEventSubResubMessageBase
	extends TwitchMessageEventMessageWithChannelUser {
	displayName: string;
	isPrime: boolean;
	months: number;
	plan: string;
	planName: string;
}

export interface TwitchMessageEventSubMessageBase extends TwitchMessageEventSubResubMessageBase {
	streak?: number;
}

export interface TwitchMessageEventResubMessageBase extends TwitchMessageEventSubResubMessageBase {
	months: number;
}

export interface TwitchMessageEventBitsBadgeUpgrade extends MessageEvent {
	messageType: TwitchMessageType.BitsBadgeUpgrade;
	message: TwitchMessageEventMessageWithChannelUser & {
		displayName: string;
		threshold: number;
	};
}

export interface TwitchMessageEventChat extends MessageEvent {
	messageType: TwitchMessageType.Chat;
	message: TwitchMessageEventChatMessageBase;
}

export interface TwitchMessageEventChatClear extends MessageEvent {
	messageType: TwitchMessageType.ChatClear;
	message: TwitchMessageEventMessageWithChannel;
}

export interface TwitchMessageEventCheer extends MessageEvent {
	messageType: TwitchMessageType.Cheer;
	message: TwitchMessageEventChatMessageBase & {
		totalBits: number;
	};
}

export interface TwitchMessageEventCommunitySubAnonymous extends MessageEvent {
	messageType: TwitchMessageType.CommunitySub;
	message: TwitchMessageEventCommunitySubMessageBase;
}

export interface TwitchMessageEventCommunitySubNamed extends MessageEvent {
	messageType: TwitchMessageType.CommunitySub;
	message: TwitchMessageEventCommunitySubMessageBase & TwitchMessageEventMessageWithGifter;
}

export type TwitchMessageEventCommunitySub = TwitchMessageEventCommunitySubAnonymous
	| TwitchMessageEventCommunitySubNamed;

export interface TwitchMessageEventEmoteOnly extends MessageEvent {
	messageType: TwitchMessageType.EmoteOnly;
	message: TwitchMessageEventMessageWithChannel & {
		enabled: boolean;
	};
}

export interface TwitchMessageEventFollowersOnlyEnabled extends MessageEvent {
	messageType: TwitchMessageType.FollowersOnly;
	message: TwitchMessageEventMessageWithChannel & {
		enabled: true;
		delay: number;
	};
}

export interface TwitchMessageEventFollowersOnlyDisabled extends MessageEvent {
	messageType: TwitchMessageType.FollowersOnly;
	message: TwitchMessageEventMessageWithChannel & {
		enabled: false;
	};
}

export type TwitchMessageEventFollowersOnly = TwitchMessageEventFollowersOnlyEnabled
	| TwitchMessageEventFollowersOnlyDisabled;

export interface TwitchMessageEventHost extends MessageEvent {
	messageType: TwitchMessageType.Host;
	message: TwitchMessageEventMessageWithChannel & {
		target: string;
		viewers?: number;
	};
}

export interface TwitchMessageEventHosted extends MessageEvent {
	messageType: TwitchMessageType.Hosted;
	message: TwitchMessageEventMessageWithChannel & {
		byChannel: string;
		auto: boolean;
		viewers?: number;
	};
}

export interface TwitchMessageEventHostsRemaining extends MessageEvent {
	messageType: TwitchMessageType.HostsRemaining;
	message: TwitchMessageEventMessageWithChannel & {
		numberOfHosts: number;
	};
}

export interface TwitchMessageEventJoin extends MessageEvent {
	messageType: TwitchMessageType.Join;
	message: TwitchMessageEventMessageWithChannelUser;
}

export interface TwitchMessageEventNewChatter extends MessageEvent {
	messageType: TwitchMessageType.NewChatter;
	message: TwitchMessageEventMessageWithChannelUser;
}

export interface TwitchMessageEventPart extends MessageEvent {
	messageType: TwitchMessageType.Part;
	message: TwitchMessageEventMessageWithChannelUser;
}

export interface TwitchMessageEventR9k extends MessageEvent {
	messageType: TwitchMessageType.R9k;
	message: TwitchMessageEventMessageWithChannel & {
		enabled: boolean;
	};
}

export interface TwitchMessageEventRaid extends MessageEvent {
	messageType: TwitchMessageType.Raid;
	message: TwitchMessageEventMessageWithChannelUser & {
		displayName: string;
		viewerCount: number;
	};
}

export interface TwitchMessageEventResubWithoutMessage extends MessageEvent {
	messageType: TwitchMessageType.Resub;
	message: TwitchMessageEventResubMessageBase;
}

export interface TwitchMessageEventResubWithMessage extends MessageEvent {
	messageType: TwitchMessageType.Resub;
	message: TwitchMessageEventResubMessageBase & TwitchMessageEventMessageWithMessage;
}

export type TwitchMessageEventResub = TwitchMessageEventResubWithoutMessage
	| TwitchMessageEventResubWithMessage;

export interface TwitchMessageEventRitual extends MessageEvent {
	messageType: TwitchMessageType.Ritual;
	message: TwitchMessageEventMessageWithChannelUser & {
		ritualName: string;
	};
}

export interface TwitchMessageEventSlowEnabled extends MessageEvent {
	messageType: TwitchMessageType.Slow;
	message: TwitchMessageEventMessageWithChannel & {
		enabled: true;
		delay: number;
	};
}

export interface TwitchMessageEventSlowDisabled extends MessageEvent {
	messageType: TwitchMessageType.Slow;
	message: TwitchMessageEventMessageWithChannel & {
		enabled: false;
	};
}

export type TwitchMessageEventSlow = TwitchMessageEventSlowEnabled | TwitchMessageEventSlowDisabled;

export interface TwitchMessageEventSubWithoutMessage extends MessageEvent {
	messageType: TwitchMessageType.Sub;
	message: TwitchMessageEventSubMessageBase;
}

export interface TwitchMessageEventSubWithMessage extends MessageEvent {
	messageType: TwitchMessageType.Sub;
	message: TwitchMessageEventSubMessageBase & TwitchMessageEventMessageWithMessage;
}

export type TwitchMessageEventSub = TwitchMessageEventSubWithoutMessage
	| TwitchMessageEventSubWithMessage;

export interface TwitchMessageEventSubGiftAnonymousWithoutMessage extends MessageEvent {
	messageType: TwitchMessageType.SubGift;
	message: TwitchMessageEventSubMessageBase;
}

export interface TwitchMessageEventSubGiftAnonymousWithMessage extends MessageEvent {
	messageType: TwitchMessageType.SubGift;
	message: TwitchMessageEventSubMessageBase & TwitchMessageEventMessageWithMessage;
}

export interface TwitchMessageEventSubGiftNamedWithoutMessage extends MessageEvent {
	messageType: TwitchMessageType.SubGift;
	message: TwitchMessageEventSubMessageBase & TwitchMessageEventMessageWithGifter;
}

export interface TwitchMessageEventSubGiftNamedWithMessage extends MessageEvent {
	messageType: TwitchMessageType.SubGift;
	message: TwitchMessageEventSubMessageBase
		& TwitchMessageEventMessageWithGifter
		& TwitchMessageEventMessageWithMessage;
}

export type TwitchMessageEventSubGift = TwitchMessageEventSubGiftAnonymousWithoutMessage
	| TwitchMessageEventSubGiftAnonymousWithMessage
	| TwitchMessageEventSubGiftNamedWithoutMessage
	| TwitchMessageEventSubGiftNamedWithMessage;

export interface TwitchMessageEventSubsOnly extends MessageEvent {
	messageType: TwitchMessageType.SubsOnly;
	message: TwitchMessageEventMessageWithChannel & {
		enabled: boolean;
	};
}

export interface TwitchMessageEventTimeout extends MessageEvent {
	messageType: TwitchMessageType.Timeout;
	message: TwitchMessageEventMessageWithChannelUser & {
		reason: string;
		duration: number;
	};
}

export interface TwitchMessageEventUnhost extends MessageEvent {
	messageType: TwitchMessageType.Unhost;
	message: TwitchMessageEventMessageWithChannel;
}

export interface TwitchMessageEventWhisper extends MessageEvent {
	messageType: TwitchMessageType.Whisper;
	message: TwitchMessageEventMessageWithUser & TwitchMessageEventMessageWithMessage;
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

export type ExtractTwitchMessage<T> = Extract<TwitchMessageEvent, { messageType: T }>['message'];

export interface TwitchAlertsConfig extends ModuleConfig {
	twitchModuleId: string;
}
