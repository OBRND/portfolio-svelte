import type { Action } from 'svelte/action';

export interface MagneticOptions {
	/** How far the element follows the cursor, as a fraction of the offset. */
	strength?: number;
}

/**
 * Pulls an element a little toward the cursor while it is hovered and lets it
 * spring back on leave. Fine pointers only — on touch there is no hover to
 * follow, and under reduced motion it stays put.
 */
export const magnetic: Action<HTMLElement, MagneticOptions | undefined> = (node, options = {}) => {
	if (typeof window === 'undefined') return {};
	const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!fine || reduced) return {};

	let strength = options.strength ?? 0.28;
	let raf = 0;
	let tx = 0;
	let ty = 0;
	let x = 0;
	let y = 0;

	const step = () => {
		x += (tx - x) * 0.16;
		y += (ty - y) * 0.16;
		node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
		if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) {
			raf = requestAnimationFrame(step);
		} else {
			raf = 0;
			if (tx === 0 && ty === 0) node.style.transform = '';
		}
	};

	const kick = () => {
		if (!raf) raf = requestAnimationFrame(step);
	};

	const onMove = (event: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		tx = (event.clientX - (rect.left + rect.width / 2)) * strength;
		ty = (event.clientY - (rect.top + rect.height / 2)) * strength;
		kick();
	};

	const onLeave = () => {
		tx = 0;
		ty = 0;
		kick();
	};

	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);

	return {
		update(next = {}) {
			strength = next.strength ?? 0.28;
		},
		destroy() {
			if (raf) cancelAnimationFrame(raf);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
};
