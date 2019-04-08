import {
	BasicModule,
	ServerEvent,
	ServerEventType,
	ServerApi,
	ModuleApi,
	ModuleType,
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
				await this.onMessage(event.fromModuleId, event.messageType, JSON.parse(event.message));
				break;
			case ServerEventType.Heartbeat:
				await this.onHeartbeat();
				break;
		}
	}

	protected init = async (): Promise<ModuleApi | void> => {};
	protected onInitComplete = async () => {};
	protected onMessage = async (fromModuleId: string, messageType: string, message: any) => {};
	protected onHeartbeat = async () => {};
}

export default AbstractBasicModule;
