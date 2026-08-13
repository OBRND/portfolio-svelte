import type { Action } from 'svelte/action';

/**
 * Moves a node to `document.body`.
 *
 * The public layout translates `.sliding-content` to reveal the footer, and a
 * transformed ancestor becomes the containing block for `position: fixed`
 * descendants. Overlays rendered in place would therefore be positioned
 * against that moving element rather than the viewport, so they are relocated
 * out of the transformed subtree.
 */
export const portal: Action<HTMLElement, string | HTMLElement | undefined> = (node, target) => {
	let host: HTMLElement | null = null;

	function mount(to: string | HTMLElement | undefined) {
		host =
			typeof to === 'string'
				? document.querySelector<HTMLElement>(to)
				: (to ?? document.body);
		host?.appendChild(node);
	}

	mount(target);

	return {
		update(next) {
			mount(next);
		},
		destroy() {
			if (node.parentNode) node.parentNode.removeChild(node);
		}
	};
};
