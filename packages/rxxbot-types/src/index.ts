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

export interface MessageEventMessage {
	[key: string]: any;
}

export interface MessageEvent {
	type: ServerEventType.Message;
	fromModuleId?: string;
	fromScreenId?: string;
	messageType: string;
	message: MessageEventMessage;
}

export interface HeartbeatEvent {
	type: ServerEventType.Heartbeat;
}

export type ServerEvent = InitCompleteEvent | MessageEvent | HeartbeatEvent;

export interface ServerApi {
	sendMessage: (messageType: string, message: MessageEventMessage) => Promise<void>;
	store: <T = any>(key: string, value: T) => Promise<void>;
	fetch: <T = any>(key: string) => Promise<T | null>;
	remove: (key: string) => Promise<void>;
	heartbeat?: () => Promise<void>;
	sendMessageFromScreen?: (
		screenId: string,
		messageType: string,
		message: MessageEventMessage,
	) => Promise<void>;
}

export enum SocketIoEvent {
	ServerEvent = 'serverEvent',
	ScreenMessage = 'screenMessage',
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
	BitsBadgeUpgrade = 'Twitch.bitsBadgeUpgrade',
	Chat = 'Twitch.chat',
	ChatClear = 'Twitch.chatClear',
	Cheer = 'Twitch.cheer',
	CommunitySub = 'Twitch.communitySub',
	EmoteOnly = 'Twitch.emoteOnly',
	Follow = 'Twitch.follow',
	FollowersOnly = 'Twitch.followersOnly',
	Host = 'Twitch.host',
	Hosted = 'Twitch.hosted',
	HostsRemaining = 'Twitch.hostsRemaining',
	Join = 'Twitch.join',
	NewChatter = 'Twitch.newChatter',
	Part = 'Twitch.part',
	R9k = 'Twitch.r9k',
	Raid = 'Twitch.raid',
	Resub = 'Twitch.resub',
	Ritual = 'Twitch.ritual',
	Slow = 'Twitch.slow',
	Sub = 'Twitch.sub',
	SubGift = 'Twitch.subGift',
	SubsOnly = 'Twitch.subsOnly',
	Timeout = 'Twitch.timeout',
	Unhost = 'Twitch.unhost',
	Whisper = 'Twitch.whisper',
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

export interface TwitchMessageEventFollow extends MessageEvent {
	messageType: TwitchMessageType.Follow;
	message: TwitchMessageEventMessageWithChannelUser;
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
	| TwitchMessageEventFollow
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

export interface TwitchAlertBaseConfig {
	captionTemplates?: string[];
	crawlTemplates?: string[];
	videos: (string | {
		video: string;
		credit?: string;
		captionTemplates?: string[] | null;
		crawlTemplates?: string[] | null;
	})[];
}

export interface TwitchAlertStaticConfig extends TwitchAlertBaseConfig {
	type: TwitchMessageType | TwitchMessageType[];
}

export interface TwitchAlertCallbackConfig {
	type: TwitchMessageType | TwitchMessageType[];
	callback: (message: MessageEventMessage) => TwitchAlertBaseConfig | null;
}

export type TwitchAlertConfig = TwitchAlertStaticConfig | TwitchAlertCallbackConfig;

export const isTwitchAlertCallbackConfig = (
	config: TwitchAlertConfig,
): config is TwitchAlertCallbackConfig => {
	return !!(config as TwitchAlertCallbackConfig).callback;
};

export interface TwitchAlertsConfig extends ModuleConfig {
	twitchModuleId: string;
	videoAlertsScreenId: string;
	chyronScreenId: string;
	channel?: string;
	alerts: TwitchAlertConfig[];
	crawlMessages?: string[];
}

export enum VideoAlertsMessageType {
	ShowAlert = 'VideoAlerts.showAlert',
}

export interface VideoAlertsEventShowAlert extends MessageEvent {
	messageType: VideoAlertsMessageType.ShowAlert;
	message: {
		screenId: string;
		video: string;
		text?: string;
		credit?: string;
	};
}

export interface ChyronConfig {
	crawlMessages: string[];
	crawlDelay: number;
}

export enum ChyronMessageType {
	RequestConfig = 'Chyron.requestConfig',
	SetConfig = 'Chyron.setConfig',
	QueueCrawlMessage = 'Chyron.queueCrawlMessage',
}

export interface ChyronMessageEventRequestConfig extends MessageEvent {
	messageType: ChyronMessageType.RequestConfig;
}

export interface ChyronMessageEventSetConfig extends MessageEvent {
	messageType: ChyronMessageType.SetConfig;
	message: {
		screenId: string;
		config: Partial<ChyronConfig>;
	};
}

export interface ChyronMessageEventQueueCrawlMessage extends MessageEvent {
	messageType: ChyronMessageType.QueueCrawlMessage;
	message: {
		crawlMessage: string;
	};
}
