import type { Action } from 'svelte/action';

/**
 * Stamps `data-inview` on an element while any of it is on screen.
 *
 * It exists so looping animations can be paused when nobody can see them:
 * `animation-play-state: paused` by default, `running` under `[data-inview]`.
 * A CSS animation that is off screen is not painted, but it is still ticked
 * every frame, and a handful of those keep a phone's main thread awake for
 * the whole visit.
 */
let observer: IntersectionObserver | null = null;

export const inview: Action<HTMLElement> = (node) => {
	if (typeof IntersectionObserver === 'undefined') {
		node.setAttribute('data-inview', '');
		return {};
	}

	observer ??= new IntersectionObserver((entries) => {
		for (const entry of entries) entry.target.toggleAttribute('data-inview', entry.isIntersecting);
	});
	observer.observe(node);

	return {
		destroy() {
			observer?.unobserve(node);
		}
	};
};
