import StorageModule from './StorageModule';

export interface MemoryStoreConfig {}

interface MemoryStoreData {
	[moduleId: string]: {
		[key: string]: string;
	};
}

class MemoryStore extends StorageModule<MemoryStoreConfig> {
	private data: MemoryStoreData = {};

	constructor(config: MemoryStoreConfig = {}) {
		super(config);
	}

	public store = async (moduleId: string, key: string, value: string) => {
		if (!this.data[moduleId]) {
			this.data[moduleId] = {};
		}
		this.data[moduleId][key] = value;
	}

	public fetch = async (moduleId: string, key: string) =>
		(this.data[moduleId] && this.data[moduleId].hasOwnProperty(key))
			? this.data[moduleId][key]
			: null

	public remove = async (moduleId: string, key: string) => {
		if (this.data[moduleId]) {
			delete this.data[moduleId][key];
		}
	}
}

export default MemoryStore;
