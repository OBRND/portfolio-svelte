import type { Action } from 'svelte/action';

function reducedMotion() {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);
}

/**
 * A tap/click spawns an expanding, fading dot from the pointer position —
 * mostly a mobile win, it makes a tap feel acknowledged the instant it lands
 * rather than only once whatever it triggered finishes loading.
 *
 * Clips to the button's own box via a dedicated inserted layer rather than
 * `overflow: hidden` on the node itself, since some callers (the service
 * card's CTA) rely on an oversized `::after` for hit-area and would have it
 * clipped away.
 */
export const ripple: Action<HTMLElement> = (node) => {
	if (getComputedStyle(node).position === 'static') {
		node.style.position = 'relative';
	}

	const clip = document.createElement('span');
	clip.className = 'u-ripple-clip';
	clip.setAttribute('aria-hidden', 'true');
	node.insertBefore(clip, node.firstChild);

	function onPointerDown(event: PointerEvent) {
		if (reducedMotion() || (event.button !== undefined && event.button !== 0)) return;
		const rect = node.getBoundingClientRect();
		const size = Math.max(rect.width, rect.height) * 1.8;
		const dot = document.createElement('span');
		dot.className = 'u-ripple-dot';
		dot.style.width = `${size}px`;
		dot.style.height = `${size}px`;
		dot.style.left = `${event.clientX - rect.left - size / 2}px`;
		dot.style.top = `${event.clientY - rect.top - size / 2}px`;
		clip.appendChild(dot);
		dot.addEventListener('animationend', () => dot.remove());
	}

	node.addEventListener('pointerdown', onPointerDown);

	return {
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			clip.remove();
		}
	};
};
