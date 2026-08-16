import type { Action } from 'svelte/action';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomChar() {
	return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function reducedMotion() {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);
}

/**
 * Decodes `node`'s text from random characters into the real string, settling
 * left to right. Used on text that changes wholesale (the header's divider
 * title) rather than being typed — a plain fade/slide undersells the "this
 * label just landed here" moment, a decode reads as arriving with intent.
 */
export const scramble: Action<HTMLElement, string> = (node, text) => {
	let raf = 0;

	function run(target: string, duration = 420) {
		cancelAnimationFrame(raf);
		if (reducedMotion() || !target) {
			node.textContent = target;
			return;
		}
		const start = performance.now();
		const length = target.length;
		const step = (now: number) => {
			const t = Math.min((now - start) / duration, 1);
			const settled = Math.floor(t * length);
			let out = '';
			for (let i = 0; i < length; i++) {
				out += i < settled || target[i] === ' ' ? target[i] : randomChar();
			}
			node.textContent = out;
			if (t < 1) {
				raf = requestAnimationFrame(step);
			} else {
				node.textContent = target;
			}
		};
		raf = requestAnimationFrame(step);
	}

	run(text);

	return {
		update(next) {
			run(next);
		},
		destroy() {
			cancelAnimationFrame(raf);
		}
	};
};
