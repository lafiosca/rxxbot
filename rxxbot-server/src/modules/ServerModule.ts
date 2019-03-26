abstract class ServerModule {
	protected api: any = null;

	protected init = async () => {};

	public initWithApi = async (api: any) => {
		this.api = api;
		await this.init();
	}

	public onEvent = async (event: any) => {};
}

export default ServerModule;
