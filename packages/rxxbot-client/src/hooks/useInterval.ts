import { useEffect, useRef, useCallback } from 'react';

export const useInterval = (
	callback: () => void,
	delay: number | null,
	deps?: any[],
) => {
	const savedCallback = useRef<() => void>();
	const memo = useCallback(callback, deps || [callback]);

	useEffect(
		() => {
			console.log('resetting useInterval callback memo');
			savedCallback.current = memo;
		},
		[memo],
	);

	useEffect(
		() => {
			console.log('resetting useInterval setInterval');
			if (delay !== null) {
				const id = setInterval(
					() => {
						if (savedCallback.current) {
							savedCallback.current();
						}
					},
					delay,
				);
				return () => clearInterval(id);
			}
		},
		[delay],
	);
};
