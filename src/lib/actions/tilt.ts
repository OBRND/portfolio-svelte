import type { Action } from 'svelte/action';

export interface TiltOptions {
	/** Max rotation in degrees at the pointer's furthest reach from center. */
	max?: number;
}

/**
 * A light 3D tilt that follows the pointer, via `--tilt-rx`/`--tilt-ry`
 * custom properties the consumer's own CSS reads into a `transform`. Mouse
 * only — `hover: hover` and `pointer: fine` both have to hold, so touch
 * devices (which can't hover) never see it and never pay for the listener.
 */
export const tilt: Action<HTMLElement, TiltOptions | undefined> = (node, options = {}) => {
	let max = options.max ?? 8;

	const supportsHover =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	if (!supportsHover || reduced) return {};

	let raf = 0;

	/* Cached rather than read per frame: the node is mid-transform on the very
	   frame the callback runs, so measuring there forces a layout for a box
	   that has not moved since the pointer entered. */
	let rect: DOMRect | null = null;

	function invalidate() {
		rect = null;
	}

	function onMove(event: PointerEvent) {
		if (raf) return;
		raf = requestAnimationFrame(() => {
			raf = 0;
			if (!rect) rect = node.getBoundingClientRect();
			const px = (event.clientX - rect.left) / rect.width;
			const py = (event.clientY - rect.top) / rect.height;
			const rx = (0.5 - py) * max * 2;
			const ry = (px - 0.5) * max * 2;
			node.style.setProperty('--tilt-rx', `${rx.toFixed(2)}deg`);
			node.style.setProperty('--tilt-ry', `${ry.toFixed(2)}deg`);
			node.style.setProperty('--tilt-transition', '80ms');
		});
	}

	function onLeave() {
		node.style.setProperty('--tilt-rx', '0deg');
		node.style.setProperty('--tilt-ry', '0deg');
		node.style.setProperty('--tilt-transition', '500ms');
	}

	node.addEventListener('pointerenter', invalidate);
	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);
	window.addEventListener('resize', invalidate, { passive: true });
	window.addEventListener('scroll', invalidate, { passive: true });

	return {
		update(next = {}) {
			max = next.max ?? 8;
		},
		destroy() {
			if (raf) cancelAnimationFrame(raf);
			node.removeEventListener('pointerenter', invalidate);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			window.removeEventListener('resize', invalidate);
			window.removeEventListener('scroll', invalidate);
		}
	};
};
