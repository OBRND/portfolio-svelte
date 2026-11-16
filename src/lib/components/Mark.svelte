<script lang="ts">
	interface Props {
		size?: number | string;
		/** Draws the strokes in on mount instead of showing them at once. */
		draw?: boolean;
		class?: string;
	}

	let { size = 28, draw = false, class: className = '' }: Props = $props();
</script>

<!--
	The OB monogram, redrawn as strokes from static/ob-logo.png so it can take
	`currentColor`, scale without a raster edge, and be drawn in line by line.
-->
<svg
	class="mark {className}"
	class:draw
	viewBox="0 0 1024 1024"
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	stroke-width="84"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path pathLength="1" d="M510 100 150 512 510 925" />
	<path pathLength="1" d="M510 100V925" />
	<path pathLength="1" d="M510 100 845 290 562 438 875 575 510 925" />
</svg>

<style>
	.mark {
		flex-shrink: 0;
		overflow: visible;
	}

	.draw path {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: draw 1100ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
	}

	.draw path:nth-child(2) {
		animation-delay: 160ms;
	}

	.draw path:nth-child(3) {
		animation-delay: 320ms;
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
