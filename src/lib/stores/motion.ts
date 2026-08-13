import { readable } from 'svelte/store';

/**
 * Live `prefers-reduced-motion` state. CSS handles the declarative animations,
 * but the JS-driven motion in this project — the project stack's drag physics,
 * autoplay, and the tweened card transforms — has to opt out explicitly, and
 * it reads this store to do so.
 *
 * Readable rather than a one-time boolean because visitors can flip the OS
 * setting mid-session and the stack should respond without a reload.
 */
export const reducedMotion = readable(false, (set) => {
	if (typeof window === 'undefined' || !window.matchMedia) return;

	const query = window.matchMedia('(prefers-reduced-motion: reduce)');
	set(query.matches);

	const onChange = (event: MediaQueryListEvent) => set(event.matches);
	query.addEventListener('change', onChange);

	return () => query.removeEventListener('change', onChange);
});
