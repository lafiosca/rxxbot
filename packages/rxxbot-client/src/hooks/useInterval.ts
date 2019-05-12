import { useEffect, useRef } from 'react';

export const useInterval = (
	callback: () => void,
	delay: number | null,
) => {
	const savedCallback = useRef<() => void>();

	useEffect(
		() => {
			console.log('useInterval:useEffect(callback)');
			savedCallback.current = callback;
		},
		[callback],
	);

	useEffect(
		() => {
			console.log('useInterval:useEffect(delay)');
			if (delay !== null) {
				const id = setInterval(
					() => {
						if (savedCallback.current) {
							console.log('call savedCallback.current');
							savedCallback.current();
						} else {
							console.log('no savedCallback.current');
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
