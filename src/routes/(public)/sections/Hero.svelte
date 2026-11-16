<script lang="ts">
	import { onMount } from 'svelte';
	import { ready } from '$lib/stores/stage';
	import { progress, addSnap, docTop } from '$lib/motion/scroll';
	import { magnetic } from '$lib/actions/magnetic';
	import { person } from '$lib/data/site';

	const rows = [person.first.split(''), person.last.split('')];

	const PORTRAIT = { dark: '/ob.webp', light: '/ob1.webp' };

	let track = $state<HTMLElement | null>(null);
	let nameEl = $state<HTMLElement | null>(null);

	/**
	 * The name reacts to the cursor: each letter puts on weight as the pointer
	 * nears it, using the typeface's variable weight axis. It is the only
	 * "animation" the hero has at rest, and it is entirely typographic.
	 *
	 * Letter centres are cached rather than measured per frame. They do drift a
	 * little as neighbours change weight — that is the effect — so they are
	 * refreshed every few frames while the pointer is active, which is cheap
	 * for twelve letters and keeps the falloff honest.
	 */
	// Fetch the other theme's portrait once the page has settled, unless the
	// visitor has asked their browser to save data.
	onMount(() => {
		if ((navigator as any).connection?.saveData) return;
		const other = document.documentElement.classList.contains('light') ? PORTRAIT.dark : PORTRAIT.light;
		const timer = setTimeout(() => (new Image().src = other), 4500);
		return () => clearTimeout(timer);
	});

	onMount(() => {
		const stopSnap = addSnap(() => (track ? [docTop(track)] : []));

		const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!fine || reduced || !nameEl) return stopSnap;

		const letters = Array.from(nameEl.querySelectorAll<HTMLElement>('.ch'));
		const REST = 300;
		const PEAK = 780;
		const weights = letters.map(() => REST);
		const targets = letters.map(() => REST);
		let centres: { x: number; y: number }[] = [];
		let raf = 0;
		let frame = 0;
		let px = -9999;
		let py = -9999;

		const measure = () => {
			centres = letters.map((el) => {
				const r = el.getBoundingClientRect();
				return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
			});
		};

		const step = () => {
			if (frame++ % 8 === 0) measure();
			const radius = Math.max(window.innerWidth * 0.26, 260);
			let active = false;

			for (let i = 0; i < letters.length; i++) {
				const c = centres[i];
				const d = Math.hypot(c.x - px, c.y - py);
				const pull = Math.max(0, 1 - d / radius);
				targets[i] = REST + (PEAK - REST) * pull * pull;
				weights[i] += (targets[i] - weights[i]) * 0.12;
				if (Math.abs(targets[i] - weights[i]) > 0.5) active = true;
				letters[i].style.fontWeight = weights[i].toFixed(0);
			}

			raf = active ? requestAnimationFrame(step) : 0;
		};

		const kick = () => {
			if (!raf) raf = requestAnimationFrame(step);
		};

		const onMove = (event: PointerEvent) => {
			px = event.clientX;
			py = event.clientY;
			kick();
		};

		const onLeave = () => {
			px = -9999;
			py = -9999;
			kick();
		};

		window.addEventListener('pointermove', onMove, { passive: true });
		document.documentElement.addEventListener('pointerleave', onLeave);

		return () => {
			stopSnap();
			if (raf) cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onMove);
			document.documentElement.removeEventListener('pointerleave', onLeave);
		};
	});
</script>

<!--
	Taller than the viewport so the hero holds for a moment as you start to
	scroll: the two halves of the name slide apart and the portrait swells and
	fades, all scrubbed from `--p`, before the page moves on.
-->
<section class="track" bind:this={track} use:progress data-section="top" data-mood="dusk">
	<svg class="portrait-filters" width="0" height="0" aria-hidden="true" focusable="false">
		<defs>
			<!-- Soften the crown's alpha edge, preserving the portrait's source colours. -->
			<filter id="portrait-crown-soft" x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB">
				<feComponentTransfer in="SourceAlpha" result="solid-alpha">
					<feFuncA type="linear" slope="2" />
				</feComponentTransfer>
				<feMorphology in="solid-alpha" operator="erode" radius="0.0022 0.0027" result="inset-alpha" />
				<feGaussianBlur in="inset-alpha" stdDeviation="0.0016 0.0020" result="soft-alpha" />
				<feComposite in="SourceGraphic" in2="soft-alpha" operator="in" result="soft-portrait" />
				<feFlood x="0" y="0" width="1" height="0.34" flood-color="white" result="crown-band" />
				<feGaussianBlur in="crown-band" stdDeviation="0 0.012" result="crown-zone" />
				<feComposite in="soft-portrait" in2="crown-zone" operator="in" result="crown" />
				<feComposite in="SourceGraphic" in2="crown-zone" operator="out" result="rest" />
				<feComposite in="crown" in2="rest" operator="arithmetic" k2="1" k3="1" />
			</filter>
		</defs>
	</svg>
	<div class="hero" class:ready={$ready}>
		<!--
			The light behind the figure: a disc and two orbits, standing where
			the head is. By day it is the sun the page is lit by, at night the
			moon — the same size and place in both, dissolving at the lower
			edge so it stays behind the figure. It rises as the hero lets go.
		-->
		<div class="sun" aria-hidden="true">
			<span class="disc"></span>
			<span class="ring ring-a"></span>
			<span class="ring ring-b"></span>
		</div>

		<div class="meta">
			<span class="u-label">{person.role}</span>
		</div>

		<!--
			The person, not a picture of one: the photograph's backdrop is cut
			away, so the figure stands directly in the page's own sky with the
			name set around it — one row behind, one across the chest. Two
			sources because the light has to suit the ground: a low-key frame at
			night, the colour one by day. Only the one in use is fetched for
			first paint (a hidden lazy image is never requested); the other is
			warmed a few seconds later so the first theme switch still has it.
		-->
		<div class="portrait" aria-hidden="true">
			<img class="night" src={PORTRAIT.dark} alt="" width="1383" height="1137" loading="lazy" fetchpriority="high" decoding="async" />
			<img class="day" src={PORTRAIT.light} alt="" width="1383" height="1137" loading="lazy" fetchpriority="high" decoding="async" />
		</div>

		<h1 class="name" bind:this={nameEl} aria-label={person.name}>
			{#each rows as row, r}
				<span class="row row-{r}" aria-hidden="true">
					<span class="row-clip">
						{#each row as letter, i}
							<span class="ch" style="--d: {r * 5 + i}">{letter}</span>
						{/each}
					</span>
				</span>
			{/each}
		</h1>

		<div class="foot">
			<p class="statement">
				I design the <span class="u-serif">systems</span> apps run on, not just the
				<span class="u-serif">screens</span>.
			</p>

			<div class="cta">
				<span use:magnetic>
					<a class="u-btn solid" href="#projects">
						See the work
						<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M7 17 17 7M9 7h8v8" />
						</svg>
					</a>
				</span>
				<span use:magnetic>
					<a class="u-btn" href={person.cv} download>CV</a>
				</span>
			</div>
		</div>
	</div>
</section>

<style>
	.track {
		--p: 0;
		position: relative;
		height: 165vh;
	}

	.hero {
		position: sticky;
		top: 0;
		display: grid;
		grid-template-rows: auto 1fr auto;
		height: 100vh;
		height: 100svh;
		padding: calc(var(--header-h) + 0.5rem) var(--gutter) clamp(1.25rem, 2.6vw, 2.25rem);
		overflow: hidden;
	}

	/* ---- Meta ------------------------------------------------------------- */

	.meta {
		position: relative;
		z-index: 4;
		opacity: calc(1 - var(--p) * 3);
	}

	.meta > * {
		opacity: 0;
		transform: translateY(10px);
		transition:
			opacity 900ms ease 700ms,
			transform 1100ms var(--ease-out) 700ms;
	}

	.ready .meta > * {
		opacity: 1;
		transform: none;
	}

	/* ---- Sun -------------------------------------------------------------- */

	.sun {
		position: absolute;
		left: 50%;
		top: 51%;
		/* One size for the sun and the moon: a big disc, wider than the gap
		   between the two halves of the name. */
		width: min(76svh, 60vw);
		aspect-ratio: 1;
		/* Under both rows of the name and the figure. */
		z-index: 0;
		transform: translate3d(-50%, calc(-50% - var(--p) * 10svh), 0) scale(calc(1 + var(--p) * 0.14));
		opacity: calc(1 - var(--p) * 1.15);
		pointer-events: none;
	}

	.disc,
	.ring {
		position: absolute;
		border-radius: 50%;
		opacity: 0;
		transform: scale(0.86);
		transition:
			opacity 1600ms ease 300ms,
			transform 2400ms var(--ease-out) 300ms;
	}

	.ready .disc,
	.ready .ring {
		opacity: 1;
		transform: none;
	}

	/*
		The disc dissolves toward its lower edge in both themes. The portrait
		fades out at the bottom too, and a disc this size reaches down into
		that fade — left solid, it showed through the chest and read as sitting
		in front of the figure. Faded, it stays behind.
	*/
	.disc {
		inset: 0;
		-webkit-mask-image: linear-gradient(to bottom, #000 50%, transparent 95%);
		mask-image: linear-gradient(to bottom, #000 50%, transparent 95%);
	}

	/* Night: the moon. Lit from above the head and falling away steeply
	   toward the limb, so it reads as a body rather than a flat disc — and so
	   it is dim out where the two halves of the name cross it. The maria are
	   kept to the rim, the only part the head leaves showing. */
	:global(:root.dark) .disc {
		background:
			radial-gradient(11% 9% at 27% 15%, rgba(58, 63, 92, 0.34), transparent),
			radial-gradient(9% 8% at 71% 11%, rgba(58, 63, 92, 0.3), transparent),
			radial-gradient(6% 9% at 88% 34%, rgba(58, 63, 92, 0.26), transparent),
			radial-gradient(7% 8% at 13% 33%, rgba(58, 63, 92, 0.24), transparent),
			radial-gradient(
				circle closest-side at 50% 30%,
				#f4f0e7 0%,
				#e2dfdc 48%,
				#b9b9c8 86%,
				#8a8ca6 122%,
				#666883 160%,
				#4f516b 205%,
				#3f4159 250%
			);
		box-shadow:
			0 0 70px rgba(216, 220, 255, 0.26),
			0 0 200px rgba(150, 160, 255, 0.2);
	}

	/* Day: the sun, pale at the crown and hot toward the horizon. */
	:global(:root.light) .disc {
		background: linear-gradient(180deg, #ffe2b8 0%, #ffb37e 34%, #ff7a48 68%, #f2551f 100%);
		box-shadow: 0 0 120px rgba(255, 122, 72, 0.4);
	}

	.ring {
		border: 1px solid var(--line);
		-webkit-mask-image: linear-gradient(to bottom, #000 40%, transparent 88%);
		mask-image: linear-gradient(to bottom, #000 40%, transparent 88%);
	}

	.ring-a {
		inset: -11%;
		transition-delay: 450ms;
	}

	.ring-b {
		inset: -25%;
		border-style: dashed;
		border-color: var(--line-hairline);
		transition-delay: 600ms;
	}

	/* ---- Portrait --------------------------------------------------------- */

	.portrait-filters {
		position: absolute;
		overflow: hidden;
		pointer-events: none;
	}

	.portrait {
		position: absolute;
		left: 50%;
		bottom: 0;
		width: min(96svh, 100vw);
		aspect-ratio: 1383 / 1137;
		/* Between the two rows of the name: see `.row` below. */
		z-index: 2;
		transform: translate3d(-50%, calc(var(--p) * 5%), 0) scale(calc(1 + var(--p) * 0.16));
		transform-origin: 50% 100%;
		opacity: calc(1 - var(--p) * 1.3);
		pointer-events: none;
	}

	.portrait img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: 50% 100%;
		/* The frame ends at the chest; let it dissolve into the page rather
		   than stop at a hard line, which also keeps the foot legible. */
		-webkit-mask-image: linear-gradient(to bottom, #000 68%, transparent 99%);
		mask-image: linear-gradient(to bottom, #000 68%, transparent 99%);
		opacity: 0;
		transform: translate3d(0, 4%, 0) scale(1.04);
		transform-origin: 50% 100%;
		transition:
			opacity 1400ms ease 500ms,
			transform 2200ms var(--ease-out) 500ms;
	}

	.ready .portrait img {
		opacity: 1;
		transform: none;
	}

	.portrait .night {
		filter: url(#portrait-crown-soft) contrast(1.06) brightness(1.04);
	}

	.portrait .day {
		display: none;
		filter: url(#portrait-crown-soft) saturate(0.92) contrast(1.03);
	}

	:global(:root.light) .portrait .night {
		display: none;
	}

	:global(:root.light) .portrait .day {
		display: block;
	}

	/* ---- Name ------------------------------------------------------------- */

	.name {
		display: grid;
		align-content: center;
		font-family: var(--font-display);
		/* Bound by width and by height, so it fills a phone held upright and a
		   short wide laptop alike without the two rows colliding with the foot. */
		font-size: min(26.5vw, 30svh);
		font-weight: 300;
		font-stretch: 75%;
		line-height: 0.8;
		letter-spacing: -0.03em;
	}

	/* The rows are stacked either side of the figure: the first name passes
	   behind it, the surname in front. The fade lives on the rows rather than
	   on the heading, since an opacity there would trap both in one layer. */
	.row {
		position: relative;
		display: block;
		white-space: nowrap;
		opacity: calc(1 - var(--p) * 1.2);
		will-change: transform;
	}

	/* At night the name is pale and so is the moon it crosses: a thin dark
	   edge keeps the letters cut out against it. Over the sky it is invisible.
	   Kept tight on purpose — a wide one is cut off square by the row's clip
	   and shows as a dark band across the moon. */
	:global(:root.dark) .row {
		text-shadow:
			0 0 0.025em rgba(7, 8, 12, 0.75),
			0 0 0.07em rgba(7, 8, 12, 0.4);
	}

	.row-0 {
		z-index: 1;
		transform: translate3d(calc(var(--p) * -22vw), 0, 0);
	}

	.row-1 {
		z-index: 3;
		text-align: right;
		transform: translate3d(calc(var(--p) * 22vw), 0, 0);
	}

	/* Clips only the bottom edge: the letters wait below it and rise through.
	   The other three sides are left open so a heavy letter under the cursor
	   is never shaved. */
	.row-clip {
		display: inline-block;
		clip-path: inset(-0.3em -0.5em -0.02em -0.5em);
	}

	.ch {
		display: inline-block;
		transform: translate3d(0, 112%, 0);
		transition: transform 1300ms var(--ease-out);
		transition-delay: calc(var(--d) * 45ms);
	}

	.ready .ch {
		transform: none;
	}

	/* ---- Foot ------------------------------------------------------------- */

	.foot {
		position: relative;
		z-index: 4;
		display: grid;
		gap: var(--sp-5);
		align-items: end;
		opacity: calc(1 - var(--p) * 3);
	}

	.foot > * {
		opacity: 0;
		transform: translateY(14px);
		transition:
			opacity 900ms ease 900ms,
			transform 1200ms var(--ease-out) 900ms;
	}

	.ready .foot > * {
		opacity: 1;
		transform: none;
	}

	.statement {
		max-width: 21ch;
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 2.3vw, 2.1rem);
		font-weight: 400;
		line-height: 1.08;
		letter-spacing: var(--tracking-head);
	}

	.statement .u-serif {
		font-size: 1.1em;
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.cta > span {
		display: inline-block;
	}

	/* ---- Layout ----------------------------------------------------------- */

	@media (max-width: 640px) {
		/* Too narrow for the name to pass either side of the figure, so the
		   name takes the top of the screen and the figure stands under it. */
		.name {
			align-content: start;
			padding-top: clamp(1rem, 4svh, 2.5rem);
		}

		.portrait {
			width: min(116vw, 58svh);
			bottom: 15%;
		}

		.sun {
			top: 54%;
			width: min(98vw, 50svh);
		}
	}

	@media (min-width: 900px) {
		.name {
			font-size: min(21vw, 37svh);
		}

		.foot {
			grid-template-columns: 1fr 1fr;
		}

		.cta {
			justify-content: flex-end;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.row-0,
		.row-1,
		.portrait {
			transform: none;
		}

		.sun {
			transform: translate(-50%, -50%);
			opacity: 1;
		}

		.portrait {
			transform: translateX(-50%);
			opacity: 1;
		}
	}
</style>
