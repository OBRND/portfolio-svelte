<script lang="ts">
	import { onMount } from 'svelte';
	import { reveal } from '$lib/actions/reveal';
	import { onFrame, addSnap, docTop } from '$lib/motion/scroll';

	type Art = 'system' | 'phone' | 'browser' | 'design' | 'release';

	/**
	 * One plain line per service and the stack terms a recruiter searches for.
	 * The six-bullet "what this delivers" lists the old dialogs carried are
	 * gone: nobody opened them, and the line already says it.
	 */
	const services: { title: string; line: string; stack: string[]; tone: string; art: Art }[] = [
		{
			// First on purpose: it is the part of the work the screens depend on,
			// and the part most portfolios leave out.
			title: 'Systems & backend',
			line: 'The data model, APIs and access rules, designed first so every app on top stays simple.',
			stack: ['PostgreSQL', 'Supabase', 'Firebase', 'Auth & RLS', 'Realtime'],
			tone: 'mint',
			art: 'system'
		},
		{
			title: 'Mobile apps',
			line: 'One Flutter codebase, released on the App Store and Google Play.',
			stack: ['Flutter', 'Dart', 'Riverpod', 'Firebase', 'Hive'],
			tone: 'azure',
			art: 'phone'
		},
		{
			title: 'Web apps',
			line: 'Server-rendered SvelteKit that loads fast and stays crawlable.',
			stack: ['SvelteKit', 'TypeScript', 'Supabase', 'Postgres', 'Vercel'],
			tone: 'ember',
			art: 'browser'
		},
		{
			title: 'Interface design',
			line: 'Designed in Figma, then built to actually match the mockup.',
			stack: ['Figma', 'Design tokens', 'Components', 'WCAG AA'],
			tone: 'lilac',
			art: 'design'
		},
		{
			title: 'Release & deploy',
			line: 'Automated builds, signed releases and monitored rollouts.',
			stack: ['GitHub Actions', 'Codemagic', 'Fastlane', 'Crashlytics'],
			tone: 'neutral',
			art: 'release'
		}
	];

	let slots = $state<HTMLElement[]>([]);
	let cards = $state<HTMLElement[]>([]);

	/**
	 * Each card sticks under the header and the next one slides up over it.
	 * `--c` is how far a card has been covered: 0 the moment it sticks, 1 when
	 * its successor has fully arrived. The card shrinks back and dims on it, so
	 * the pile reads as depth rather than as four sheets at one distance.
	 *
	 * The sentinel in front of each card marks its un-stuck position in the
	 * flow; comparing that with where the card is actually being held gives the
	 * covered distance without any knowledge of the layout above.
	 */
	onMount(() => {
		// Where each card is held. Read once and on resize, not per frame —
		// `getComputedStyle` inside the scroll loop would force a style pass
		// on every frame for a value that only changes with the viewport.
		let tops: number[] = [];
		const readTops = () => {
			tops = cards.map((card) => (card ? parseFloat(getComputedStyle(card).top) || 0 : 0));
		};
		readTops();
		window.addEventListener('resize', readTops);

		// What each card was last given, so a frame in which nothing in the
		// pile moved (all of them, once it is off screen) writes no styles.
		const written: string[] = [];

		const stopFrame = onFrame(() => {
			const rects = slots.map((slot) => slot?.getBoundingClientRect().top ?? 0);
			for (let i = 0; i < cards.length; i++) {
				let value = 0;
				if (i < cards.length - 1) {
					const span = rects[i + 1] - rects[i];
					value = span > 0 ? Math.min(Math.max((tops[i] - rects[i]) / span, 0), 1) : 0;
				}
				const next = value.toFixed(3);
				if (written[i] === next) continue;
				written[i] = next;
				cards[i]?.style.setProperty('--c', next);
			}
		});

		// Rest on each card just as it locks into place.
		const stopSnap = addSnap(() => slots.map((slot, i) => (slot ? docTop(slot) - tops[i] : 0)));

		return () => {
			window.removeEventListener('resize', readTops);
			stopFrame();
			stopSnap();
		};
	});
</script>

<section class="services" id="services" data-section="services" data-mood="low">
	<header class="head u-shell">
		<span class="u-label">03 — Services</span>
		<h2 class="title u-lines" data-reveal use:reveal>
			<span class="u-line"><span>What I can</span></span>
			<span class="u-line"><span><span class="u-serif">build</span> for you.</span></span>
		</h2>
	</header>

	<ol class="pile u-shell">
		{#each services as service, i}
			<li class="slot">
				<span class="sentinel" bind:this={slots[i]} aria-hidden="true"></span>
				<article class="card tone-{service.tone}" bind:this={cards[i]} style="--i: {i}">
					<div class="card-top">
						<span class="idx">0{i + 1}</span>
						<span class="idx">/ 0{services.length}</span>
					</div>

					<svg class="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						{#if service.art === 'system'}
							<ellipse cx="100" cy="34" rx="34" ry="12" />
							<path d="M66 34v26c0 6.6 15.2 12 34 12s34-5.4 34-12V34" />
							<path d="M66 47c0 6.6 15.2 12 34 12s34-5.4 34-12" opacity="0.55" />
							<path d="M100 72v26M100 98H44v24M100 98h56v24M100 98v24" opacity="0.6" />
							<rect x="20" y="122" width="48" height="56" rx="8" />
							<rect x="78" y="122" width="44" height="34" rx="6" />
							<rect x="132" y="122" width="48" height="44" rx="6" />
							<circle cx="100" cy="98" r="3.5" />
						{:else if service.art === 'phone'}
							<rect x="62" y="12" width="76" height="164" rx="16" />
							<rect x="88" y="22" width="24" height="7" rx="3.5" />
							<path d="M76 60h48M76 76h30M76 124h48M76 140h20" opacity="0.55" />
							<circle cx="100" cy="100" r="11" />
						{:else if service.art === 'browser'}
							<rect x="14" y="34" width="172" height="124" rx="10" />
							<path d="M14 58h172" />
							<circle cx="28" cy="46" r="2.6" /><circle cx="38" cy="46" r="2.6" /><circle cx="48" cy="46" r="2.6" />
							<path d="M30 80h62M30 96h44M30 134h28" opacity="0.55" />
							<rect x="112" y="76" width="56" height="62" rx="5" />
						{:else if service.art === 'design'}
							<circle cx="76" cy="84" r="52" />
							<rect x="84" y="78" width="88" height="88" rx="4" />
							<path d="M22 172C64 172 84 124 120 96S172 44 180 22" opacity="0.6" />
							<circle cx="22" cy="172" r="4" /><circle cx="180" cy="22" r="4" />
						{:else}
							<path d="M100 178V40" /><path d="M64 76l36-36 36 36" />
							<path d="M40 178a60 60 0 0 1 120 0" opacity="0.6" />
							<path d="M12 178a88 88 0 0 1 176 0" opacity="0.35" />
							<path d="M8 178h184" />
						{/if}
					</svg>

					<h3 class="card-title">{service.title}</h3>

					<div class="card-foot">
						<p class="line">{service.line}</p>
						<ul class="tags">
							{#each service.stack as tag}
								<li>{tag}</li>
							{/each}
						</ul>
					</div>
				</article>
			</li>
		{/each}
	</ol>
</section>

<style>
	.services {
		position: relative;
		padding-top: clamp(2rem, 5vw, 4rem);
		padding-bottom: clamp(3rem, 8vw, 7rem);
	}

	.head {
		display: grid;
		gap: var(--sp-5);
		margin-bottom: clamp(2rem, 5vw, 4rem);
	}

	.title {
		font-size: var(--fs-h1);
		font-weight: 300;
		font-stretch: 82%;
		line-height: 0.92;
		letter-spacing: var(--tracking-display);
	}

	.title .u-serif {
		color: var(--ember);
	}

	/* ---- Pile ------------------------------------------------------------- */

	.pile {
		list-style: none;
	}

	/* `display: contents` so every card's sticky container is the pile itself:
	   each one holds until the whole pile has scrolled through, rather than
	   letting go as soon as its own list item ends. */
	.slot {
		display: contents;
	}

	.sentinel {
		display: block;
		height: 0;
	}

	.card {
		--c: 0;
		--card-h: clamp(24rem, 68svh, 40rem);
		position: sticky;
		/* Each card stops a little lower than the last, so the edges of the
		   ones underneath stay visible as a stack. */
		top: calc(var(--header-h) + 0.5rem + var(--i) * 0.7rem);
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: var(--sp-5);
		height: var(--card-h);
		margin-bottom: clamp(3rem, 14svh, 9rem);
		padding: clamp(1.25rem, 2.8vw, 2.5rem);
		border-radius: var(--r-xl);
		background: var(--tone);
		color: var(--ink);
		overflow: hidden;
		transform: scale(calc(1 - var(--c) * 0.07));
		transform-origin: 50% 0;
		will-change: transform;
	}

	/* The dimming of a covered card: an overlay, not a filter, so it costs a
	   single composited layer instead of re-rasterising the card each frame. */
	.card::after {
		content: '';
		position: absolute;
		inset: 0;
		background: #000;
		opacity: calc(var(--c) * 0.42);
		pointer-events: none;
	}

	.tone-mint {
		--tone: var(--poster-mint);
		--ink: var(--poster-ink);
	}

	.tone-azure {
		--tone: var(--poster-azure);
		--ink: var(--poster-ink);
	}

	.tone-ember {
		--tone: var(--poster-ember);
		--ink: var(--poster-ink);
	}

	.tone-lilac {
		--tone: var(--poster-lilac);
		--ink: var(--poster-ink);
	}

	.tone-neutral {
		--tone: var(--poster-neutral);
		--ink: var(--poster-neutral-ink);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
	}

	.idx {
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		font-weight: 500;
		letter-spacing: var(--tracking-eyebrow);
		opacity: 0.72;
	}

	.art {
		position: absolute;
		right: clamp(1rem, 4vw, 4rem);
		top: 50%;
		width: min(46%, calc(var(--card-h) * 0.62));
		height: auto;
		max-width: none;
		transform: translateY(-54%) rotate(calc(-6deg + var(--c) * 10deg));
		opacity: 0.9;
		pointer-events: none;
	}

	.card-title {
		position: relative;
		align-self: center;
		max-width: 9ch;
		font-size: clamp(3.2rem, 10.5vw, 11rem);
		font-size: clamp(3.2rem, min(10.5vw, 17svh), 11rem);
		font-weight: 300;
		font-stretch: 75%;
		line-height: 0.84;
		letter-spacing: -0.03em;
		color: inherit;
	}

	.card-foot {
		position: relative;
		display: grid;
		gap: var(--sp-4);
		align-items: end;
	}

	.line {
		max-width: 30ch;
		font-size: var(--fs-lead);
		line-height: 1.25;
		letter-spacing: -0.02em;
	}

	.tags {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1rem;
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.tags li + li::before {
		content: '/';
		margin-right: 1rem;
		opacity: 0.45;
	}

	@media (max-width: 700px) {
		.art {
			top: 30%;
			right: -6%;
			width: 54%;
			opacity: 0.5;
		}
	}

	@media (min-width: 860px) {
		.card-foot {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.tags {
			justify-content: flex-end;
			max-width: 28rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			position: relative;
			top: auto;
			transform: none;
			margin-bottom: var(--sp-5);
		}

		.card::after {
			display: none;
		}
	}
</style>
