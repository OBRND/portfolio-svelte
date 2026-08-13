import type { Action } from 'svelte/action';

export interface RevealOptions {
	/** Milliseconds to stagger this element behind its neighbours. */
	delay?: number;
	/** Travel distance in px before settling. Negative moves down-to-up. */
	y?: number;
	/** Starting scale, for cards that should bloom rather than slide. */
	scale?: number;
	/** Re-hide and replay when the element leaves the viewport. */
	repeat?: boolean;
	/** Fraction of the element that must be visible to trigger. */
	threshold?: number;
}

/**
 * One observer per (threshold, repeat) pairing rather than one per element —
 * the page reveals well over a hundred nodes and a dedicated observer for each
 * is measurably worse on low-end mobile.
 */
const observers = new Map<string, IntersectionObserver>();
const settings = new WeakMap<Element, RevealOptions>();

function getObserver(threshold: number, repeat: boolean): IntersectionObserver {
	const key = `${threshold}:${repeat}`;
	let observer = observers.get(key);
	if (observer) return observer;

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.setAttribute('data-reveal', 'in');
					if (!repeat) observer!.unobserve(entry.target);
				} else if (repeat) {
					entry.target.setAttribute('data-reveal', '');
				}
			}
		},
		// The bottom inset starts the animation slightly before the element
		// reaches the fold, so it has finished by the time it is properly read.
		{ threshold, rootMargin: '0px 0px -8% 0px' }
	);

	observers.set(key, observer);
	return observer;
}

export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, options = {}) => {
	const apply = (opts: RevealOptions) => {
		settings.set(node, opts);
		if (opts.delay) node.style.setProperty('--reveal-delay', `${opts.delay}ms`);
		if (opts.y !== undefined) node.style.setProperty('--reveal-y', `${opts.y}px`);
		if (opts.scale !== undefined) node.style.setProperty('--reveal-scale', String(opts.scale));
	};

	apply(options);

	// No IntersectionObserver (or reduced motion) — show the content and stop.
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	if (typeof IntersectionObserver === 'undefined' || reduced) {
		node.setAttribute('data-reveal', 'in');
		return {};
	}

	let threshold = options.threshold ?? 0.12;
	let repeat = options.repeat ?? false;
	let observer = getObserver(threshold, repeat);
	observer.observe(node);

	return {
		update(next = {}) {
			apply(next);
			const nextThreshold = next.threshold ?? 0.12;
			const nextRepeat = next.repeat ?? false;
			if (nextThreshold === threshold && nextRepeat === repeat) return;
			observer.unobserve(node);
			threshold = nextThreshold;
			repeat = nextRepeat;
			observer = getObserver(threshold, repeat);
			observer.observe(node);
		},
		destroy() {
			observer.unobserve(node);
			settings.delete(node);
		}
	};
};
