<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { theme } from '$lib/stores/theme';
	import { reducedMotion } from '$lib/stores/motion';
	import { reveal } from '$lib/actions/reveal';
	import { inview } from '$lib/actions/inview';
	import { progress } from '$lib/motion/scroll';
	import type ReactGlobe from '$lib/components/globe.svelte';
	import { CLOUD_ID } from '$lib/components/react/cloudId.js';

	/** simple-icons slugs rendered into the rotating cloud. */
	const simpleIconSlugs = [
		'javascript',
		'typescript',
		'python',
		'dart',
		'flutter',
		'css3',
		'android',
		'git',
		'html5',
		'googlecloud',
		'github',
		'figma',
		'sqlite',
		'postgresql',
		'supabase',
		'vercel',
		'firebase',
		'svelte',
		'cplusplus',
		'cloudinary',
		'appstore'
	];

	/**
	 * Logos simple-icons does not carry, or carries only in the flat monochrome
	 * it mandates for brand-guideline reasons, supplied as images instead.
	 */
	const customImageData = [
		{ src: '/java.svg', id: 'java', alt: 'Java Logo' },
		{ src: '/flutter_flow.webp', id: 'flutterflow', alt: 'FlutterFlow Logo' },
		{ src: '/hive.webp', id: 'hive-logo', alt: 'Hive Logo' },
		{ src: '/google-play.svg', id: 'googleplay', alt: 'Google Play Logo' }
	];

	type Tone = 'mint' | 'azure' | 'ember' | 'lilac' | 'neutral';

	interface Group {
		label: string;
		tone: Tone;
		items: string[];
	}

	/**
	 * The stack, as a stack: top to bottom, the order things sit in. What ships
	 * is on top, the two front ends share a level under it, the languages run
	 * through everything, and the backend is the slab it all stands on. A level
	 * with two groups is drawn as one plate cut in two.
	 *
	 * The tones are the Services posters' — backend mint, mobile azure, web
	 * ember, delivery neutral — so a colour means the same thing in both.
	 */
	const layers: Group[][] = [
		[{ label: 'Delivery', tone: 'neutral', items: ['Git', 'GitHub', 'Figma', 'Vercel', 'Google Play', 'App Store'] }],
		[
			{ label: 'Mobile', tone: 'azure', items: ['Flutter', 'FlutterFlow', 'Android', 'Hive'] },
			{ label: 'Web', tone: 'ember', items: ['SvelteKit', 'Svelte', 'HTML', 'CSS'] }
		],
		[{ label: 'Languages', tone: 'lilac', items: ['Dart', 'TypeScript', 'JavaScript', 'Java', 'Python', 'C++'] }],
		[
			{
				label: 'Backend',
				tone: 'mint',
				items: ['Supabase', 'Firebase', 'PostgreSQL', 'SQLite', 'Google Cloud', 'Cloudinary']
			}
		]
	];

	const groups = layers.flat();

	/*
		One isometric plate, as three polygons: the top face and the two walls
		that face the viewer. `u` runs from the plate's top corner to its right
		one, `v` from the top corner to the left one, so a plate that covers only
		part of `u` is a plate cut across.
	*/
	const HALF_W = 100;
	const HALF_H = 50;
	const THICK = 15;
	const corner = (u: number, v: number, drop = 0) =>
		`${((u - v) * HALF_W).toFixed(1)},${((u + v - 1) * HALF_H + drop).toFixed(1)}`;

	function slab(u0: number, u1: number) {
		return {
			top: [corner(u0, 0), corner(u1, 0), corner(u1, 1), corner(u0, 1)].join(' '),
			left: [corner(u0, 1), corner(u1, 1), corner(u1, 1, THICK), corner(u0, 1, THICK)].join(' '),
			right: [corner(u1, 1), corner(u1, 0), corner(u1, 0, THICK), corner(u1, 1, THICK)].join(' ')
		};
	}

	const cuts = (count: number) => (count === 1 ? [slab(0, 1)] : [slab(0, 0.465), slab(0.535, 1)]);

	const slugToTech: Record<string, string> = {
		javascript: 'JavaScript',
		typescript: 'TypeScript',
		java: 'Java',
		python: 'Python',
		dart: 'Dart',
		flutter: 'Flutter',
		css3: 'CSS',
		android: 'Android',
		git: 'Git',
		html5: 'HTML',
		googlecloud: 'Google Cloud',
		'hive-logo': 'Hive',
		github: 'GitHub',
		figma: 'Figma',
		flutterflow: 'FlutterFlow',
		sqlite: 'SQLite',
		postgresql: 'PostgreSQL',
		supabase: 'Supabase',
		vercel: 'Vercel',
		firebase: 'Firebase',
		svelte: 'Svelte',
		cplusplus: 'C++',
		cloudinary: 'Cloudinary',
		googleplay: 'Google Play',
		appstore: 'App Store'
	};

	/** The other way round, for turning the globe to a name picked in the list. */
	const techToSlug: Record<string, string> = {
		...Object.fromEntries(Object.entries(slugToTech).map(([slug, name]) => [name, slug])),
		// No logo of its own in the cloud; Svelte's stands for it.
		SvelteKit: 'svelte'
	};

	/**
	 * How a build actually goes, written for the person commissioning it: what
	 * happens at each step, what they walk away from it holding, and which of
	 * the tools above does the work. It is drawn in station by station as the
	 * page scrolls.
	 */
	const steps = [
		{
			word: 'Plan',
			does: 'We agree what it has to do, then I map the data behind it and who is allowed to see what.',
			get: 'A clear scope and a data plan',
			tools: ['PostgreSQL', 'Supabase']
		},
		{
			word: 'Design',
			does: 'Every screen is drawn and linked together before a line of code is written.',
			get: 'A clickable prototype to approve',
			tools: ['Figma']
		},
		{
			word: 'Build',
			does: 'The backend goes in first. The mobile and web apps are built on top of it.',
			get: 'Working versions to try as it grows',
			tools: ['Flutter', 'SvelteKit', 'Firebase']
		},
		{
			word: 'Ship',
			does: 'Signed releases go out to the stores and the web, and are watched after launch.',
			get: 'Your app in the stores, your site live',
			tools: ['App Store', 'Google Play', 'Vercel']
		}
	];

	/*
		The two orbits drawn round the globe — azure for the mobile side of the
		work, ember for the web. A circle of radius `r` leaning back by `lean`
		shows as an ellipse `r` wide and `r·cos(lean)` tall; `tilt` then turns
		it on the page. The line is that ellipse in SVG, and the satellite rides
		an invisible circle given the same lean and tilt in CSS, so the two
		always agree. `r` is in percent of the globe's box.

		Each orbit is drawn as two arcs. The top half of the leaning circle is
		the half that has tipped away from the viewer, so it goes behind the
		logos; the bottom half has tipped toward them and goes in front.
	*/
	const orbits = [
		{ r: 59, lean: 76, tilt: -17, period: 26, tone: 'azure' },
		{ r: 47, lean: 67, tilt: 26, period: 19, tone: 'ember' }
	].map((orbit) => {
		const ry = (orbit.r * Math.cos((orbit.lean * Math.PI) / 180)).toFixed(2);
		return {
			...orbit,
			back: `M${-orbit.r} 0A${orbit.r} ${ry} 0 0 1 ${orbit.r} 0`,
			front: `M${orbit.r} 0A${orbit.r} ${ry} 0 0 1 ${-orbit.r} 0`
		};
	});

	let Globe = $state<typeof ReactGlobe | null>(null);
	let active = $state<string | null>(null);
	let touched = $state(false);
	/** The group under the pointer or holding focus in the list. */
	let hovered = $state<string | null>(null);
	let orbEl = $state<HTMLElement | null>(null);
	let sectionEl = $state<HTMLElement | null>(null);
	let clearTimer: ReturnType<typeof setTimeout> | null = null;

	const activeGroup = $derived(
		active ? (groups.find((g) => g.items.includes(active!))?.label ?? null) : null
	);
	/** The plate that is lifted: what is being pointed at, else what was picked. */
	const lit = $derived(hovered ?? activeGroup);

	function onIconClick(identifier: string) {
		const name = slugToTech[identifier] ?? null;
		touched = true;
		if (clearTimer) clearTimeout(clearTimer);
		active = name;
		if (name) clearTimer = setTimeout(() => (active = null), 4200);
	}

	/**
	 * A name picked in the list: say so in the readout, and turn the globe
	 * until that logo faces the front. Like the scroll nudge below, this goes
	 * to the `TagCanvas` global rather than through React.
	 */
	function pick(name: string) {
		touched = true;
		if (clearTimer) clearTimeout(clearTimer);
		active = name;
		clearTimer = setTimeout(() => (active = null), 6000);

		const slug = techToSlug[name];
		const TagCanvas = (window as any).TagCanvas;
		if (!slug || !TagCanvas) return;
		try {
			TagCanvas.TagToFront('canvas-' + CLOUD_ID, { id: 'tag-' + slug, time: 900 });
		} catch {
			/* the cloud has not started yet; the readout alone still answers */
		}
	}

	// The globe brings React and a canvas engine with it. None of that is
	// needed to paint the hero, so it is fetched when the section is about a
	// screen away rather than on load — which matters most on a phone.
	onMount(() => {
		let cancelled = false;
		const load = () =>
			import('$lib/components/globe.svelte').then((module) => {
				if (!cancelled) Globe = module.default;
			});

		let near: IntersectionObserver | null = null;
		if (sectionEl && typeof IntersectionObserver !== 'undefined') {
			near = new IntersectionObserver(
				(entries) => {
					if (!entries.some((entry) => entry.isIntersecting)) return;
					near?.disconnect();
					load();
				},
				{ rootMargin: '120% 0px' }
			);
			near.observe(sectionEl);
		} else {
			load();
		}

		return () => {
			cancelled = true;
			near?.disconnect();
			if (clearTimer) clearTimeout(clearTimer);
		};
	});

	/**
	 * A light rotational nudge tied to the visitor's own scrolling, on top of
	 * the globe's idle drift and direct drag.
	 *
	 * This talks to the `TagCanvas` global directly (the engine
	 * `react-icon-cloud` starts the canvas under, keyed by `CLOUD_ID`) rather
	 * than routing the nudge through a prop into React, which would re-render
	 * the whole React tree on every scroll frame. Desktop only — touch's
	 * drag-to-spin is tuned separately in globe.jsx.
	 */
	onMount(() => {
		if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;

		let lastY = window.scrollY;
		let raf = 0;
		let decayRaf = 0;

		function nudge(dx: number, dy: number) {
			const TagCanvas = (window as any).TagCanvas;
			if (!TagCanvas) return;
			const canvasId = 'canvas-' + CLOUD_ID;
			// Matches globe.jsx's non-touch `options.initial`.
			const idle = [0.1, -0.1];

			if (decayRaf) cancelAnimationFrame(decayRaf);
			let x = idle[0] + dx;
			let y = idle[1] + dy;

			const step = () => {
				x += (idle[0] - x) * 0.12;
				y += (idle[1] - y) * 0.12;
				if (!TagCanvas.SetSpeed(canvasId, [x, y])) return;
				if (Math.abs(x - idle[0]) > 0.001 || Math.abs(y - idle[1]) > 0.001) {
					decayRaf = requestAnimationFrame(step);
				}
			};
			decayRaf = requestAnimationFrame(step);
		}

		const onScroll = () => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				const dy = window.scrollY - lastY;
				lastY = window.scrollY;
				if (Math.abs(dy) < 2) return;

				const rect = orbEl?.getBoundingClientRect();
				const margin = window.innerHeight * 0.2;
				if (!rect || rect.bottom < -margin || rect.top > window.innerHeight + margin) return;

				const kick = Math.max(-0.16, Math.min(0.16, dy * 0.012));
				nudge(kick, kick * -0.5);
			});
		};
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			if (raf) cancelAnimationFrame(raf);
			if (decayRaf) cancelAnimationFrame(decayRaf);
		};
	});
</script>

<!--
	One half of the orbits: the arcs on that side, and a copy of each satellite
	that shows only while it is on that side. The two copies run the same
	animation in step, so the dot seems to pass from one layer to the other.
-->
{#snippet orbitLayer(side: 'back' | 'front')}
	<div class="sky {side}" aria-hidden="true">
		<svg class="orbit-lines" viewBox="-50 -50 100 100">
			{#each orbits as orbit}
				<path
					class="tone-{orbit.tone}"
					d={side === 'back' ? orbit.back : orbit.front}
					transform="rotate({orbit.tilt})"
					vector-effect="non-scaling-stroke"
				/>
			{/each}
		</svg>

		{#each orbits as orbit}
			<span
				class="orbit tone-{orbit.tone}"
				style="--r: {orbit.r}%; --lean: {orbit.lean}deg; --tilt: {orbit.tilt}deg; --t: {orbit.period}s"
			>
				<span class="arm"><span class="carrier"><i class="sat"></i></span></span>
			</span>
		{/each}
	</div>
{/snippet}

<!--
	Two ways into the same list, side by side. On one side the globe: every
	logo, loose, to spin and click, with two satellites circling it. On the
	other the same tools in the order they sit in — a stack of plates that
	pulls apart as the section scrolls in (`--lp`), each level labelled with
	what lives on it. They answer each other: click a logo and its level lifts,
	click a name and the globe turns to it.
-->
<section
	class="stack"
	id="skills"
	bind:this={sectionEl}
	use:inview
	data-section="skills"
	data-mood="azure"
>
	<header class="head u-shell">
		<span class="u-label">02 — Stack</span>
		<h2 class="title u-lines" data-reveal use:reveal>
			<span class="u-line"><span>The tools</span></span>
			<span class="u-line"><span>I <span class="u-serif">ship</span> with.</span></span>
		</h2>
	</header>

	<div class="scene u-shell">
		<div class="globe-col">
			<div class="orb" bind:this={orbEl} data-reveal use:reveal={{ y: 0, scale: 0.86 }}>
				<!--
					The logos are the planet; this is what circles it. The far
					half of each orbit sits under the canvas, the near half is
					drawn again over it (below), so the paths pass behind the
					logos and come round in front of them.
				-->
				{@render orbitLayer('back')}

				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="globe" onclick={() => (touched = true)}>
					{#if Globe}
						<Globe iconSlugs={simpleIconSlugs} imageArray={customImageData} theme={$theme} {onIconClick} />
					{:else}
						<div class="globe-loading" aria-hidden="true"></div>
					{/if}
				</div>

				{@render orbitLayer('front')}
			</div>

			<!-- What you just picked — or, until you have, an invitation to. -->
			<div class="readout" aria-live="polite">
				{#key active}
					<div
						class="readout-line"
						in:fly={{ y: 26, duration: $reducedMotion ? 0 : 560, easing: quintOut }}
						out:fly={{ y: -26, duration: $reducedMotion ? 0 : 300, easing: quintOut }}
					>
						{#if active}
							<span class="readout-name">{active}</span>
							{#if activeGroup}<span class="readout-group u-label">{activeGroup}</span>{/if}
						{:else}
							<span class="invite" class:quiet={touched}>
								<span class="invite-icon" aria-hidden="true">
									<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="m9 9 5 12 1.8-5.2L21 14Z" />
										<path d="M7.2 2.2 8 5.1M5.1 8l-2.9-.8M14 4.1 12 6.1M6.1 12l-2 2" />
									</svg>
								</span>
								<span class="invite-text">{touched ? 'Click another logo' : 'Click any logo'}</span>
								<span class="invite-sub">or drag to spin</span>
							</span>
						{/if}
					</div>
				{/key}
			</div>
		</div>

		<div class="layers" class:has-lit={lit !== null} use:progress={{ mode: 'enter', cssVar: '--lp' }}>
			<p class="layers-cap u-label">
				<span>How it stacks</span>
				<span class="layers-hint">Pick a name, the globe turns to it</span>
			</p>

			{#each layers as level, i}
				<div class="layer" style="--o: {(layers.length - 1) / 2 - i}; --z: {layers.length - i}">
					<svg class="plate" viewBox="-102 -62 204 130" aria-hidden="true">
						{#each cuts(level.length) as faces, j}
							<g class="slab tone-{level[j].tone}" class:lit={lit === level[j].label}>
								<polygon class="wall-l" points={faces.left} />
								<polygon class="wall-r" points={faces.right} />
								<polygon class="face" points={faces.top} />
							</g>
						{/each}
					</svg>

					<div class="layer-body" class:pair={level.length > 1}>
						{#each level as group}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="group tone-{group.tone}"
								class:lit={lit === group.label}
								onpointerenter={() => (hovered = group.label)}
								onpointerleave={() => (hovered = null)}
								onfocusin={() => (hovered = group.label)}
								onfocusout={() => (hovered = null)}
							>
								<h3 class="u-label"><i class="chip" aria-hidden="true"></i>{group.label}</h3>
								<ul>
									{#each group.items as item}
										<li>
											<button type="button" class:active={active === item} onclick={() => pick(item)}>{item}</button>
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!--
		How a build goes, step by step. Each station's rule is drawn across as
		the strip scrolls up the screen (`--fp`), and the station comes up from
		a trace to full ink as its rule arrives.
	-->
	<div class="flow u-shell" use:progress={{ mode: 'enter', cssVar: '--fp' }}>
		<p class="flow-cap u-label">
			<span>From idea to live</span>
			<span class="flow-hint">What happens at each step, and what you get out of it</span>
		</p>

		<ol class="steps">
			{#each steps as step, i}
				<li class="step" class:last={i === steps.length - 1} style="--i: {i}">
					<span class="step-rule" aria-hidden="true"><i></i></span>
					<span class="step-n u-label">{String(i + 1).padStart(2, '0')}</span>
					<h3 class="step-word">{step.word}</h3>
					<p class="step-does">{step.does}</p>

					<dl class="step-facts">
						<div>
							<dt class="u-label">You get</dt>
							<dd class="step-get">{step.get}</dd>
						</div>
						<div>
							<dt class="u-label">Using</dt>
							<dd>{step.tools.join(' · ')}</dd>
						</div>
					</dl>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.stack {
		position: relative;
		padding-block: var(--section-y) clamp(3.5rem, 8vw, 7rem);
		overflow: hidden;
	}

	.head {
		display: grid;
		gap: var(--sp-5);
	}

	.title {
		font-size: var(--fs-h1);
		font-weight: 300;
		font-stretch: 82%;
		line-height: 0.92;
		letter-spacing: var(--tracking-display);
	}

	.title .u-serif {
		font-size: 1.04em;
		color: var(--azure);
	}

	/* ---- Scene ------------------------------------------------------------ */

	.scene {
		--orb: min(66svh, 88vw, 620px);
		position: relative;
		display: grid;
		gap: clamp(2.5rem, 6vw, 4rem);
		margin-block: clamp(2rem, 5vw, 4rem) 0;
	}

	.globe-col {
		display: grid;
		justify-items: center;
		gap: var(--sp-5);
		min-width: 0;
	}

	/* ---- Orb -------------------------------------------------------------- */

	.orb {
		position: relative;
		display: grid;
		place-items: center;
		width: min(var(--orb), 100%);
		aspect-ratio: 1;
	}

	/* ---- Orbits ------------------------------------------------------------ */

	.sky {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	/* A little light for the logos to sit in: no shape, no edge. Both pools
	   are sized to die out inside the box, so its corners never show. */
	.sky.back {
		background:
			radial-gradient(40% 40% at 42% 40%, color-mix(in srgb, var(--azure) 16%, transparent), transparent),
			radial-gradient(34% 34% at 62% 63%, color-mix(in srgb, var(--ember) 12%, transparent), transparent);
	}

	.sky .tone-azure {
		--sat: var(--azure);
	}

	.sky .tone-ember {
		--sat: var(--ember);
	}

	.orbit-lines {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	/* Both paths are broken lines, tinted with their own satellite's colour.
	   The far arc is fainter than the near one, which is most of what makes
	   the pair read as a ring tipped in space rather than a flat oval. */
	.orbit-lines path {
		fill: none;
		stroke: color-mix(in srgb, var(--sat) 34%, var(--line-strong));
		stroke-width: 1;
		stroke-dasharray: 2 7;
		stroke-linecap: round;
	}

	.front .orbit-lines path {
		stroke: color-mix(in srgb, var(--sat) 62%, var(--text-muted));
		stroke-width: 1.4;
	}

	/*
		The circle the satellite rides. It is never seen — the SVG arcs are the
		visible line — it only carries the 3D pose. Everything that moves here
		is a transform or an opacity, so the browser's compositor runs it on
		its own.
	*/
	.orbit {
		position: absolute;
		left: calc(50% - var(--r));
		top: calc(50% - var(--r));
		width: calc(var(--r) * 2);
		height: calc(var(--r) * 2);
		transform: rotateZ(var(--tilt)) rotateX(var(--lean));
		transform-style: preserve-3d;
	}

	.arm,
	.carrier {
		position: absolute;
		transform-style: preserve-3d;
		animation: roll var(--t) linear infinite paused;
	}

	.arm {
		inset: 0;
	}

	/* Turns the other way at the same rate, cancelling the arm's spin, so the
	   satellite's own pose below is always measured from upright. */
	.carrier {
		left: 50%;
		top: 0;
		width: 0;
		height: 0;
		animation-direction: reverse;
	}

	/* Leant back by the orbit's lean, undone: the dot always faces the page,
	   round, instead of lying flat in the orbit's plane. Each layer's copy is
	   shown for its own half of the lap only — the far half, small and dim,
	   under the logos; the near half, larger and bright, over them. */
	.sat {
		position: absolute;
		left: -6px;
		top: -6px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--sat);
		box-shadow: 0 0 16px 2px var(--sat);
		transform: rotateX(calc(var(--lean) * -1));
		animation: far-half var(--t) linear infinite paused;
	}

	.front .sat {
		animation-name: near-half;
	}

	.stack:global([data-inview]) .arm,
	.stack:global([data-inview]) .carrier,
	.stack:global([data-inview]) .sat {
		animation-play-state: running;
	}

	@keyframes roll {
		to {
			transform: rotateZ(360deg);
		}
	}

	/* The lap starts at the farthest point and is nearest at half way; it
	   crosses from one layer to the other at the two ends of the ellipse. */
	@keyframes far-half {
		0%,
		100% {
			transform: rotateX(calc(var(--lean) * -1)) scale(0.66);
			opacity: 0.55;
		}
		25% {
			transform: rotateX(calc(var(--lean) * -1)) scale(0.9);
			opacity: 0.8;
		}
		25.01%,
		74.99% {
			transform: rotateX(calc(var(--lean) * -1)) scale(0.9);
			opacity: 0;
		}
		75% {
			transform: rotateX(calc(var(--lean) * -1)) scale(0.9);
			opacity: 0.8;
		}
	}

	@keyframes near-half {
		0%,
		24.99%,
		75.01%,
		100% {
			transform: rotateX(calc(var(--lean) * -1)) scale(0.9);
			opacity: 0;
		}
		25%,
		75% {
			transform: rotateX(calc(var(--lean) * -1)) scale(0.9);
			opacity: 0.8;
		}
		50% {
			transform: rotateX(calc(var(--lean) * -1)) scale(1.2);
			opacity: 1;
		}
	}

	.globe {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		cursor: grab;
	}

	.globe:active {
		cursor: grabbing;
	}

	.globe-loading {
		width: 62%;
		aspect-ratio: 1;
		border-radius: 50%;
		border: 1px dashed var(--line-strong);
		animation: turn 9s linear infinite;
	}

	@keyframes turn {
		to {
			transform: rotate(360deg);
		}
	}

	/* ---- Readout ---------------------------------------------------------- */

	.readout {
		position: relative;
		display: grid;
		justify-items: center;
		align-items: center;
		min-height: 5.75rem;
		width: 100%;
	}

	.readout-line {
		grid-area: 1 / 1;
		display: grid;
		justify-items: center;
		gap: 0.35rem;
		text-align: center;
	}

	/* The pick is set in the serif italic — a different voice from everything
	   else in the section, so it reads as the answer to the click. */
	.readout-name {
		font-family: var(--font-serif);
		font-style: italic;
		font-size: clamp(2.6rem, 5.4vw, 4.6rem);
		line-height: 0.95;
		letter-spacing: -0.02em;
		color: var(--ember);
	}

	.readout-group {
		color: var(--text-muted);
	}

	/* The invitation: big enough to read as a control, with a slow pulse so
	   the eye finds it. */
	.invite {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.8rem 1.4rem 0.8rem 0.85rem;
		border: 1px solid var(--ember);
		border-radius: var(--r-pill);
		background: color-mix(in srgb, var(--ember) 12%, transparent);
		color: var(--text);
	}

	.invite::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		border: 1px solid var(--ember);
		animation: beacon 2.4s var(--ease-out) infinite paused;
		pointer-events: none;
	}

	.stack:global([data-inview]) .invite::before,
	.stack:global([data-inview]) .invite-icon {
		animation-play-state: running;
	}

	.invite.quiet::before {
		animation: none;
		opacity: 0;
	}

	@keyframes beacon {
		0% {
			opacity: 0.9;
			transform: scale(1);
		}
		80%,
		100% {
			opacity: 0;
			transform: scale(1.18, 1.6);
		}
	}

	.invite-icon {
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		background: var(--ember);
		color: #07080c;
		animation: tap 2.4s var(--ease-in-out) infinite paused;
	}

	.invite.quiet .invite-icon {
		animation: none;
	}

	@keyframes tap {
		0%,
		60%,
		100% {
			transform: none;
		}
		72% {
			transform: scale(0.84);
		}
		84% {
			transform: scale(1.06);
		}
	}

	.invite-text {
		font-size: clamp(1.1rem, 1.7vw, 1.4rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.invite-sub {
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* ---- Layers ----------------------------------------------------------- */

	.layers {
		--lp: 0;
		/* 0 with the plates pressed together, 1 with each on its own row. */
		--e: clamp(0, calc((var(--lp) - 0.1) * 2.6), 1);
		--plate-w: clamp(6.5rem, 26vw, 10.5rem);
		display: grid;
		min-width: 0;
	}

	.layers-cap {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.3rem var(--sp-5);
		padding-bottom: var(--sp-4);
		margin-left: calc(var(--plate-w) + var(--sp-5));
	}

	.layers-hint {
		color: var(--text-muted);
	}

	.layer {
		position: relative;
		z-index: var(--z);
		display: grid;
		grid-template-columns: var(--plate-w) minmax(0, 1fr);
		align-items: center;
		gap: var(--sp-5);
	}

	/* Each plate is drawn on its own row and slid toward the middle of the
	   stack by however far the section still has to open. */
	.plate {
		width: 100%;
		height: auto;
		overflow: visible;
		transform: translate3d(0, calc((1 - var(--e)) * var(--o) * 76%), 0);
		will-change: transform;
	}

	.tone-mint {
		--tone: var(--poster-mint);
	}

	.tone-azure {
		--tone: var(--poster-azure);
	}

	.tone-ember {
		--tone: var(--poster-ember);
	}

	.tone-lilac {
		--tone: var(--poster-lilac);
	}

	.tone-neutral {
		--tone: var(--poster-neutral);
	}

	.slab {
		transition:
			transform var(--dur-slow) var(--ease-out),
			opacity var(--dur-base) ease;
	}

	.face {
		fill: var(--tone);
	}

	.wall-l {
		fill: color-mix(in srgb, var(--tone) 66%, #000);
	}

	.wall-r {
		fill: color-mix(in srgb, var(--tone) 46%, #000);
	}

	/* The dark plate needs its walls lighter than its face, or it is a blot. */
	:global(:root.light) .tone-neutral .wall-l {
		fill: color-mix(in srgb, var(--tone) 78%, #fff);
	}

	:global(:root.light) .tone-neutral .wall-r {
		fill: color-mix(in srgb, var(--tone) 64%, #fff);
	}

	.slab.lit {
		transform: translateY(-9px);
	}

	.has-lit .slab:not(.lit) {
		opacity: 0.32;
	}

	.layer-body {
		display: grid;
		gap: var(--sp-5);
		padding-block: 0.85rem;
		border-top: 1px solid var(--line);
		opacity: var(--e);
		transform: translate3d(calc((1 - var(--e)) * 28px), 0, 0);
	}

	.layer-body.pair {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.group h3 {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin-bottom: 0.3rem;
		transition: color var(--dur-base) ease;
	}

	.group.lit h3 {
		color: var(--text);
	}

	/* The plate's colour, as a small plate. */
	.chip {
		width: 0.5rem;
		height: 0.5rem;
		background: var(--tone);
		transform: rotate(45deg) scale(1);
		transition: transform var(--dur-slow) var(--ease-spring);
	}

	.group.lit .chip {
		transform: rotate(45deg) scale(1.5);
	}

	.group ul {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.05rem;
	}

	.group button {
		position: relative;
		padding-block: 0.12rem;
		font-size: var(--fs-body);
		line-height: 1.5;
		letter-spacing: -0.015em;
		color: var(--text-muted);
		white-space: nowrap;
		transition: color var(--dur-base) ease;
	}

	.group button::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.2rem;
		height: 1px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: 0 50%;
		transition: transform var(--dur-slow) var(--ease-out);
	}

	.group button:hover,
	.group button:focus-visible {
		color: var(--text);
	}

	.group button:hover::after,
	.group button.active::after {
		transform: scaleX(1);
	}

	/* The matching name changes voice with the readout. The size is nudged up
	   because the serif sets smaller than the grotesk at the same value;
	   line-height is pinned so the swap does not shift the rows below. */
	.group button.active {
		font-family: var(--font-serif);
		font-style: italic;
		font-size: 1.32rem;
		line-height: calc(var(--fs-body) * 1.5);
		letter-spacing: 0;
		color: var(--ember);
	}

	/* ---- Flow -------------------------------------------------------------- */

	.flow {
		--fp: 0;
		display: grid;
		gap: var(--sp-5);
		margin-top: clamp(3.5rem, 9vw, 8rem);
	}

	.flow-cap {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.3rem var(--sp-5);
	}

	.flow-hint {
		color: var(--text-muted);
	}

	.steps {
		list-style: none;
		display: grid;
		gap: var(--sp-7) var(--sp-5);
	}

	/* How far this station has been reached: each starts a beat after the
	   one before it, so the line reads as one stroke crossing the page. */
	.step {
		--s: clamp(0, calc((var(--fp) - 0.12 - var(--i) * 0.09) * 7), 1);
		position: relative;
		display: grid;
		align-content: start;
		gap: 0.5rem;
		padding-top: 1.1rem;
	}

	.step-rule {
		position: absolute;
		inset: 0 0 auto;
		height: 1px;
		background: var(--line);
	}

	.step-rule i {
		position: absolute;
		inset: -0.5px 0;
		background: linear-gradient(90deg, var(--azure), var(--ember));
		transform: scaleX(var(--s));
		transform-origin: 0 50%;
	}

	/* The station itself, at the head of its rule. */
	.step-rule::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		width: 9px;
		height: 9px;
		margin-top: -4.5px;
		border-radius: 50%;
		background: var(--azure);
		transform: scale(var(--s));
	}

	.step-n {
		opacity: calc(0.4 + var(--s) * 0.6);
	}

	.step-word {
		font-family: var(--font-display);
		font-size: clamp(2.8rem, 5.6vw, 5.6rem);
		font-weight: 300;
		font-stretch: 75%;
		line-height: 0.88;
		letter-spacing: -0.03em;
		opacity: calc(0.18 + var(--s) * 0.82);
		transform: translate3d(0, calc((1 - var(--s)) * 0.14em), 0);
	}

	/* Where it has all been heading, in the title's own voice. */
	.step.last .step-word {
		font-family: var(--font-serif);
		font-style: italic;
		font-stretch: 100%;
		letter-spacing: -0.02em;
		color: var(--ember);
	}

	.step.last .step-rule::before {
		background: var(--ember);
	}

	.step-does,
	.step-facts {
		opacity: var(--s);
	}

	.step-does {
		max-width: 30ch;
		margin-top: 0.35rem;
		font-size: var(--fs-body);
		line-height: 1.4;
		letter-spacing: -0.012em;
		color: var(--text-muted);
	}

	/* The two practical answers, set like a spec sheet under each step. */
	.step-facts {
		display: grid;
		margin-top: 0.6rem;
		border-top: 1px solid var(--line);
	}

	.step-facts > div {
		display: grid;
		grid-template-columns: 4.6rem minmax(0, 1fr);
		gap: var(--sp-3);
		padding-block: 0.6rem;
		border-bottom: 1px solid var(--line);
	}

	.step-facts dt {
		padding-top: 0.22rem;
	}

	.step-facts dd {
		font-size: var(--fs-sm);
		line-height: 1.35;
		letter-spacing: -0.01em;
		color: var(--text-muted);
	}

	.step-facts .step-get {
		color: var(--text);
		font-weight: 500;
	}

	/* ---- Layout ----------------------------------------------------------- */

	@media (max-width: 560px) {
		.invite-sub,
		.layers-hint,
		.flow-hint {
			display: none;
		}

		.layer {
			gap: var(--sp-4);
		}

		.layers-cap {
			margin-left: calc(var(--plate-w) + var(--sp-4));
		}
	}

	/* Wide enough for the two to stand side by side and answer each other. */
	@media (min-width: 1000px) {
		.scene {
			--orb: min(64svh, 600px);
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: center;
			gap: clamp(2rem, 4vw, 5rem);
		}

		.layers {
			--plate-w: clamp(8rem, 11.5vw, 11.5rem);
		}
	}

	@media (min-width: 600px) {
		.steps {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1040px) {
		.steps {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: var(--sp-6);
		}
	}

	/* Leave the section rail its margin. */
	@media (min-width: 1100px) and (min-height: 620px) {
		.layers {
			padding-right: 3.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.layers {
			--e: 1;
		}

		.step {
			--s: 1;
		}
	}
</style>
