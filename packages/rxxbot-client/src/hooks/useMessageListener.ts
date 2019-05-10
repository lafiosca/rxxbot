import { useEffect } from 'react';
import { MessageEvent } from 'rxxbot-types';
import {
	addMessageListener,
	removeMessageListener,
} from '../services/socketIo';

interface UseMessageListenerFilter {
	fromModuleId?: string;
	messageType?: string;
}

export const useMessageListener = (
	filter: UseMessageListenerFilter,
	listener: (event: MessageEvent) => void,
	deps?: any[] | undefined,
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
				listener(event);
			};
			addMessageListener(filteringListener);
			return () => removeMessageListener(filteringListener);
		},
		deps,
	);
};
