import type { Action } from 'svelte/action';

/**
 * Tracks the pointer over `node` into `--glow-x`/`--glow-y`/`--glow-opacity`
 * custom properties, for a soft radial glow (painted by the consumer's own
 * CSS, typically on a `::after`) that trails the cursor across a dark
 * surface. Mouse only, same reasoning as `tilt.ts` — touch has no hover to
 * trail.
 */
export const cursorGlow: Action<HTMLElement> = (node) => {
	const supportsHover =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	if (!supportsHover || reduced) return {};

	let raf = 0;

	function onMove(event: PointerEvent) {
		if (raf) return;
		raf = requestAnimationFrame(() => {
			raf = 0;
			const rect = node.getBoundingClientRect();
			node.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
			node.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
			node.style.setProperty('--glow-opacity', '1');
		});
	}

	function onLeave() {
		node.style.setProperty('--glow-opacity', '0');
	}

	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);

	return {
		destroy() {
			if (raf) cancelAnimationFrame(raf);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
};
