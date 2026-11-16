import type { Action } from 'svelte/action';

/**
 * Sizes a single line of text so it spans its parent's width exactly.
 *
 * A viewport unit cannot do this on its own: how wide a word sets depends on
 * the typeface's own metrics, so a `vw` value that fits one name overflows
 * another and falls short on a third. This measures the line at a known size
 * and scales from there, and re-fits when the container resizes or the web
 * font swaps in (which changes the metrics after first paint).
 */
export const fit: Action<HTMLElement> = (node) => {
	const parent = node.parentElement;
	if (!parent || typeof ResizeObserver === 'undefined') return {};

	const BASE = 100;
	let width = -1;

	const apply = () => {
		const style = getComputedStyle(parent);
		const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
		if (available <= 0) return;

		// Measured, scaled, then measured again at the size it landed on. One
		// pass is not enough: the typeface has an optical-size axis, so its
		// letters set wider at 70px than at 100px and a straight proportion
		// overshoots on a phone, where the fitted size is small.
		let size = BASE;
		for (let pass = 0; pass < 4; pass++) {
			node.style.fontSize = `${size.toFixed(2)}px`;
			const natural = node.getBoundingClientRect().width;
			if (natural <= 0) break;
			const next = (size * available) / natural;
			const settled = Math.abs(next - size) < 0.2;
			size = next;
			if (settled) break;
		}
		node.style.fontSize = `${size.toFixed(2)}px`;
		width = available;
	};

	const observer = new ResizeObserver(() => {
		const style = getComputedStyle(parent);
		const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
		if (Math.abs(available - width) > 0.5) apply();
	});
	observer.observe(parent);

	apply();
	document.fonts?.ready.then(apply);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
