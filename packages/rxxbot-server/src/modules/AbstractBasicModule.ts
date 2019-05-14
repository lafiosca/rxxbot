import {
	BasicModule,
	ServerEvent,
	ServerEventType,
	ServerApi,
	ModuleApi,
	ModuleType,
	MessageEvent,
} from 'rxxbot-types';

abstract class AbstractBasicModule implements BasicModule {
	protected api: ServerApi | null = null;

	public getDefaultModuleId = () => '';
	public getDefaultModuleType = (): ModuleType => 'basic';

	public initWithApi = async (api: ServerApi) => {
		this.api = api;
		return this.init();
	}

	public onEvent = async (event: ServerEvent) => {
		switch (event.type) {
			case ServerEventType.InitComplete:
				await this.onInitComplete();
				break;
			case ServerEventType.Message:
				await this.onMessage(event);
				break;
			case ServerEventType.Heartbeat:
				await this.onHeartbeat();
				break;
		}
	}

	protected init = async (): Promise<ModuleApi | void> => {};
	protected onInitComplete = async () => {};
	protected onMessage = async (event: MessageEvent) => {};
	protected onHeartbeat = async () => {};
}

export default AbstractBasicModule;
