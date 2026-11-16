<script lang="ts">
	import { onMount } from 'svelte';
	import Mark from '$lib/components/Mark.svelte';
	import { ready } from '$lib/stores/stage';
	import { lockScroll, scrollTo } from '$lib/motion/scroll';
	import { person } from '$lib/data/site';

	/**
	 * The intro curtain. It covers the first paint while the fonts arrive — the
	 * hero is nothing but type, so showing it in a fallback face and swapping a
	 * moment later would be the first thing a visitor sees — draws the mark,
	 * counts up, then lifts and hands off to the hero's entrance.
	 *
	 * It is server-rendered so there is no flash of the page before it, which
	 * means it also has to be safe if hydration never happens: the CSS failsafe
	 * below removes it on its own after a few seconds regardless.
	 */

	const MIN_MS = 1150;
	const MAX_WAIT_MS = 2600;
	const LIFT_MS = 950;

	let count = $state(0);
	let leaving = $state(false);
	let done = $state(false);

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			done = true;
			ready.set(true);
			return;
		}

		lockScroll(true);

		const started = performance.now();
		let fontsReady = false;
		let raf = 0;
		let liftTimer: ReturnType<typeof setTimeout>;
		let doneTimer: ReturnType<typeof setTimeout>;

		document.fonts?.ready.then(() => (fontsReady = true));

		const lift = () => {
			leaving = true;
			lockScroll(false);
			// A deep link should land on its section, not on the hero.
			if (location.hash.length > 1 && document.querySelector(location.hash)) {
				scrollTo(location.hash, { immediate: true });
			}
			// The hero starts moving while the curtain is still on its way up,
			// so the two read as one gesture rather than a wait then a start.
			liftTimer = setTimeout(() => ready.set(true), 260);
			doneTimer = setTimeout(() => (done = true), LIFT_MS + 80);
		};

		const tick = (now: number) => {
			const elapsed = now - started;
			// Count on a curve that slows near the end, and hold at 99 until
			// the fonts are actually in (or we give up waiting for them).
			const t = Math.min(elapsed / MIN_MS, 1);
			const eased = 1 - Math.pow(1 - t, 3);
			const settled = fontsReady || elapsed > MAX_WAIT_MS;
			count = Math.min(Math.round(eased * 100), settled ? 100 : 99);

			if (t >= 1 && settled) {
				count = 100;
				lift();
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(liftTimer);
			clearTimeout(doneTimer);
			lockScroll(false);
		};
	});
</script>

{#if !done}
	<div class="preloader" class:leaving aria-hidden="true">
		<div class="center">
			<Mark size={72} draw />
		</div>

		<div class="foot">
			<span class="u-label">{person.name} — Portfolio</span>
			<span class="count">{String(count).padStart(3, '0')}</span>
		</div>

		<span class="bar" style="transform: scaleX({count / 100})"></span>
	</div>
{/if}

<style>
	.preloader {
		position: fixed;
		inset: 0;
		z-index: var(--z-preloader);
		display: grid;
		place-items: center;
		background: var(--bg);
		color: var(--text);
		clip-path: inset(0 0 0 0);
		transition: clip-path 950ms var(--ease-in-out);
		/* If hydration never happens, do not hold the page hostage. */
		animation: failsafe 1ms linear 7s forwards;
	}

	/* No JS at all: there is nothing to wait for. */
	:global(html:not(.js)) .preloader {
		display: none;
	}

	.preloader.leaving {
		clip-path: inset(0 0 100% 0);
	}

	.center {
		transition:
			transform 950ms var(--ease-in-out),
			opacity 500ms ease;
	}

	.leaving .center {
		transform: translate3d(0, -40vh, 0);
		opacity: 0;
	}

	.foot {
		position: absolute;
		left: var(--gutter);
		right: var(--gutter);
		bottom: clamp(1.25rem, 3vw, 2.25rem);
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--sp-4);
	}

	.count {
		font-family: var(--font-display);
		font-size: clamp(3.5rem, 11vw, 9rem);
		font-weight: 300;
		font-stretch: 75%;
		line-height: 0.8;
		letter-spacing: var(--tracking-display);
		font-variant-numeric: tabular-nums;
	}

	.bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: linear-gradient(90deg, var(--azure), var(--ember));
		transform-origin: 0 50%;
	}

	@keyframes failsafe {
		to {
			visibility: hidden;
			pointer-events: none;
		}
	}
</style>
