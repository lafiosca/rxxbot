import { useEffect } from 'react';
import { MessageEvent } from 'rxxbot-types';
import {
	addMessageListener,
	removeMessageListener,
} from '../services/socketIo';

interface UseMessageListenerFilter {
	fromModuleId?: string;
	messageType?: string;
	message?: {
		[field: string]: string;
	};
	customFilter?: (event: MessageEvent) => boolean;
}

export const useMessageListener = (
	filter: UseMessageListenerFilter,
	listener: (event: MessageEvent) => void,
	deps?: any[],
) => {
	useEffect(
		() => {
			const filteringListener = (event: MessageEvent) => {
				if (filter.fromModuleId && event.fromModuleId !== filter.fromModuleId) {
					return;
				}
				if (filter.messageType && event.messageType !== filter.messageType) {
					return;
				}
				if (filter.message) {
					const fields = Object.keys(filter.message);
					for (let i = 0; i < fields.length; i += 1) {
						const field = fields[i];
						if (event.message[field] !== filter.message[field]) {
							return;
						}
					}
				}
				if (filter.customFilter && !filter.customFilter(event)) {
					return;
				}
				listener(event);
			};
			console.log('adding message listener');
			addMessageListener(filteringListener);
			return () => {
				console.log('removing message listener');
				removeMessageListener(filteringListener);
			};
		},
		deps,
	);
};
