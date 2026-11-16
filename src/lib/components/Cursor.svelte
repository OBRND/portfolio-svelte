<script lang="ts">
	import { onMount } from 'svelte';

	/**
	 * A ring that trails the real cursor. The native pointer stays — this is a
	 * follower, not a replacement — except over elements that ask for a label
	 * with `data-cursor="View"`, where the ring swells into a disc carrying that
	 * word and the native arrow steps aside.
	 *
	 * Fine pointers only. Nothing is rendered on touch or under reduced motion.
	 */

	let enabled = $state(false);
	let el = $state<HTMLElement | null>(null);
	let label = $state('');
	let hovering = $state(false);
	let visible = $state(false);
	let pressed = $state(false);

	onMount(() => {
		const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!fine || reduced) return;
		enabled = true;

		let x = window.innerWidth / 2;
		let y = window.innerHeight / 2;
		let tx = x;
		let ty = y;
		let raf = 0;

		const step = () => {
			x += (tx - x) * 0.2;
			y += (ty - y) * 0.2;
			if (el) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
			raf = Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 ? requestAnimationFrame(step) : 0;
		};

		const onMove = (event: PointerEvent) => {
			if (event.pointerType === 'touch') return;
			tx = event.clientX;
			ty = event.clientY;
			visible = true;
			if (!raf) raf = requestAnimationFrame(step);

			const target = event.target as Element | null;
			const labelled = target?.closest?.<HTMLElement>('[data-cursor]');
			label = labelled?.dataset.cursor ?? '';
			hovering = !labelled && !!target?.closest?.('a, button, [role="button"], summary, label');
		};

		const onLeave = () => (visible = false);
		const onDown = () => (pressed = true);
		const onUp = () => (pressed = false);

		window.addEventListener('pointermove', onMove, { passive: true });
		document.documentElement.addEventListener('pointerleave', onLeave);
		window.addEventListener('pointerdown', onDown, { passive: true });
		window.addEventListener('pointerup', onUp, { passive: true });

		return () => {
			if (raf) cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onMove);
			document.documentElement.removeEventListener('pointerleave', onLeave);
			window.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointerup', onUp);
		};
	});
</script>

{#if enabled}
	<div class="cursor" bind:this={el} class:visible class:hovering class:pressed class:labelled={!!label} aria-hidden="true">
		<div class="ring">
			<span>{label}</span>
		</div>
	</div>
{/if}

<style>
	.cursor {
		position: fixed;
		top: 0;
		left: 0;
		z-index: var(--z-cursor);
		pointer-events: none;
		opacity: 0;
		transition: opacity 300ms ease;
		will-change: transform;
	}

	.cursor.visible {
		opacity: 1;
	}

	.ring {
		position: absolute;
		display: grid;
		place-items: center;
		width: 88px;
		height: 88px;
		margin: -44px 0 0 -44px;
		border-radius: 50%;
		border: 1px solid color-mix(in srgb, var(--text) 55%, transparent);
		/* Sized once at its largest and scaled down, so growing it is a pure
		   transform and the label inside stays sharp when it gets there. */
		transform: scale(0.36);
		transition:
			transform 420ms var(--ease-out),
			background-color 300ms ease,
			border-color 300ms ease;
	}

	.hovering .ring {
		transform: scale(0.62);
		background: color-mix(in srgb, var(--text) 12%, transparent);
		border-color: transparent;
	}

	.labelled .ring {
		transform: scale(1);
		background: var(--ember);
		border-color: var(--ember);
	}

	.pressed .ring {
		transform: scale(0.28);
	}

	.labelled.pressed .ring {
		transform: scale(0.88);
	}

	.ring span {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #07080c;
		opacity: 0;
		transition: opacity 200ms ease;
	}

	.labelled .ring span {
		opacity: 1;
		transition-delay: 120ms;
	}

	:global([data-cursor]) {
		cursor: none;
	}

	@media (hover: none), (pointer: coarse) {
		:global([data-cursor]) {
			cursor: auto;
		}
	}
</style>
