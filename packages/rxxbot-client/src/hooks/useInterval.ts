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
			savedCallback.current = memo;
		},
		[memo],
	);

	useEffect(
		() => {
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
