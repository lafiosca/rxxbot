import ConfigurableServerModule from './ConfigurableServerModule';

interface HeartbeatConfig {
	interval?: number;
}

class Heartbeat extends ConfigurableServerModule<HeartbeatConfig> {
	constructor(config: HeartbeatConfig = {}) {
		super({
			interval: 3600000,
			...config,
		});
	}

	protected init = async () => {
		if (!this.api!.heartbeat) {
			throw new Error('Heartbeat module requires privileged API access');
		}
		setInterval(this.heartbeat, this.config.interval);
	}

	protected heartbeat = async() => {
		console.log(`heartbeat this: ${JSON.stringify(this)}`);
		return this.api!.heartbeat!();
	}
}

export default Heartbeat;
