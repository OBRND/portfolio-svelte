import type { Action } from 'svelte/action';

export interface CursorWakeOptions {
	/** How many dots can be alive at once. Older ones are recycled. */
	count?: number;
	/** Pointer travel, in px, between emissions. */
	step?: number;
	/** How long a dot takes to burn out, in ms. */
	life?: number;
}

/**
 * Leaves a short comet wake behind the cursor, in the same two brand colours
 * the orbits use — the pointer's own path drawn in the language the rest of
 * the portrait already speaks.
 *
 * Emission is by distance travelled, not by frame: a slow drift leaves a
 * sparse trail and a fast sweep a dense one, which is what makes it read as
 * speed rather than as a fixed string of beads. Dots come from a fixed pool
 * and are animated through the Web Animations API, so there is no DOM churn
 * and no forced reflow to restart them.
 *
 * Mouse only, and off entirely under reduced motion.
 */
export const cursorWake: Action<HTMLElement, CursorWakeOptions | undefined> = (
	node,
	options = {}
) => {
	const count = options.count ?? 14;
	const step = options.step ?? 26;
	const life = options.life ?? 720;

	const fine =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	if (!fine || reduced) return {};

	const layer = document.createElement('div');
	layer.className = 'u-wake';
	layer.setAttribute('aria-hidden', 'true');

	const dots: HTMLSpanElement[] = [];
	const running: (Animation | null)[] = [];
	for (let i = 0; i < count; i++) {
		const dot = document.createElement('span');
		dot.className = 'u-wake-dot';
		layer.appendChild(dot);
		dots.push(dot);
		running.push(null);
	}
	node.appendChild(layer);

	let next = 0;
	let lastX = 0;
	let lastY = 0;
	let hasLast = false;

	let originX = 0;
	let originY = 0;
	let stale = true;

	function measure() {
		const rect = node.getBoundingClientRect();
		originX = rect.left;
		originY = rect.top;
		stale = false;
	}

	function emit(x: number, y: number, speed: number) {
		const dot = dots[next];
		running[next]?.cancel();

		/* Alternating brand colours, and a size that grows with how fast the
		   cursor is moving, so a quick sweep throws a heavier spark. */
		dot.style.setProperty('--wake-color', next % 2 ? 'var(--svelte)' : 'var(--flutter)');
		const size = 4.5 + Math.min(5, speed / 800);

		running[next] = dot.animate(
			[
				{
					transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1)`,
					width: `${size * 2}px`,
					height: `${size * 2}px`,
					opacity: 0.62
				},
				{
					transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(0.25)`,
					width: `${size * 2}px`,
					height: `${size * 2}px`,
					opacity: 0
				}
			],
			{ duration: life, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
		);

		next = (next + 1) % count;
	}

	function onMove(event: PointerEvent) {
		if (stale) measure();

		const x = event.clientX - originX;
		const y = event.clientY - originY;

		if (!hasLast) {
			lastX = x;
			lastY = y;
			hasLast = true;
			return;
		}

		const dx = x - lastX;
		const dy = y - lastY;
		const travelled = Math.hypot(dx, dy);
		if (travelled < step) return;

		/* One dot per `step` of travel, capped so a huge jump (a tab return,
		   a pointer warp) cannot flood the pool in a single event. */
		const drops = Math.min(4, Math.floor(travelled / step));
		for (let i = 1; i <= drops; i++) {
			const t = i / drops;
			emit(lastX + dx * t, lastY + dy * t, travelled * 60);
		}

		lastX = x;
		lastY = y;
	}

	function onLeave() {
		hasLast = false;
	}

	function invalidate() {
		stale = true;
	}

	node.addEventListener('pointermove', onMove, { passive: true });
	node.addEventListener('pointerleave', onLeave);
	window.addEventListener('resize', invalidate, { passive: true });
	window.addEventListener('scroll', invalidate, { passive: true });

	return {
		destroy() {
			for (const animation of running) animation?.cancel();
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			window.removeEventListener('resize', invalidate);
			window.removeEventListener('scroll', invalidate);
			layer.remove();
		}
	};
};
