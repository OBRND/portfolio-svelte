<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Two-digit index shown in the header rule, e.g. "03". */
		index?: string;
		/** Small uppercase label above the title. */
		eyebrow?: string;
		title?: string;
		/** Optional intro paragraph, constrained to a readable measure. */
		lead?: string;
		/**
		 * `inset` paints the sunken ground used to separate adjacent sections.
		 * `window` paints no ground at all, so the pinned substrate behind the
		 * page shows through and parallaxes as the section scrolls over it.
		 */
		tone?: 'plain' | 'inset' | 'window';
		/**
		 * Fades the section's ground in at its top edge, so the substrate
		 * bleeds through the seam. For a solid panel following a `window` one.
		 */
		fadeIn?: boolean;
		/** The same at the bottom edge, for a solid panel preceding a window. */
		fadeOut?: boolean;
		/**
		 * A texture belonging to this section, painted in front of whatever
		 * ground it has — so a `window` section gets the pinned substrate
		 * behind and this in front, at two different scroll speeds.
		 *
		 * `rings` concentric orbits, for the tech globe. `dots` a matrix, for a
		 * grid of cards. `split` a blue-to-orange duotone, for a two-sided
		 * comparison. `scan` fine horizontal rules, for web work.
		 */
		motif?: 'none' | 'rings' | 'dots' | 'split' | 'scan';
		/** Paints the ambient accent bloom behind the section (dark mode only). */
		ambient?: boolean;
		/** Extra classes — used to attach `.theme-flutter` / `.theme-svelte`. */
		class?: string;
		children?: Snippet;
		/** Slot rendered on the right of the header row (filters, counters). */
		aside?: Snippet;
	}

	let {
		index = '',
		eyebrow = '',
		title = '',
		lead = '',
		tone = 'plain',
		fadeIn = false,
		fadeOut = false,
		motif = 'none',
		ambient = false,
		class: className = '',
		children,
		aside
	}: Props = $props();
</script>

<div
	class="section {tone} {className}"
	class:ambient
	class:fade-in={fadeIn}
	class:fade-out={fadeOut}
>
	{#if motif !== 'none'}
		<div class="motif motif-{motif}" aria-hidden="true"></div>
	{/if}

	<div class="shell">
		{#if eyebrow || title || lead || aside}
			<header class="head">
				<!-- `data-divider`: the header title rotator in the root layout
				     watches every one of these across the page and swaps its own
				     text to whichever one has scrolled up to the header's edge. -->
				<div class="rule" data-divider data-reveal use:reveal={{ y: 12 }}>
					{#if index}<span class="index">{index}</span>{/if}
					{#if eyebrow}<span class="eyebrow">{eyebrow}</span>{/if}
					<span class="line"></span>
					{#if aside}
						<div class="aside">{@render aside()}</div>
					{/if}
				</div>

				{#if title}
					<h2 class="title" data-reveal use:reveal={{ y: 24, delay: 60 }}>{title}</h2>
				{/if}

				{#if lead}
					<p class="lead" data-reveal use:reveal={{ y: 20, delay: 120 }}>{lead}</p>
				{/if}
			</header>
		{/if}

		{@render children?.()}
	</div>
</div>

<style>
	.section {
		position: relative;
		width: 100%;
		padding-block: var(--section-y);
		color: var(--text);
	}

	/*
		The ground is painted on a pseudo-element rather than on the box itself,
		so `fade-in` below can mask it at the seam without also fading the text
		sitting on top of it.
	*/
	.section::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--section-ground, var(--bg));
		pointer-events: none;
		z-index: 0;
	}

	.section.inset {
		--section-ground: var(--bg-inset);
	}

	/* No ground: the pinned substrate behind the page shows through here. */
	.section.window {
		--section-ground: transparent;
	}

	/* Lets the substrate bleed through the edge of a solid panel, so a handoff
	   to or from a window section is a transition rather than a hard line. */
	.section.fade-in::before {
		-webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 140px);
		mask-image: linear-gradient(to bottom, transparent 0, #000 140px);
	}

	.section.fade-out::before {
		-webkit-mask-image: linear-gradient(to top, transparent 0, #000 140px);
		mask-image: linear-gradient(to top, transparent 0, #000 140px);
	}

	.section.fade-in.fade-out::before {
		-webkit-mask-image: linear-gradient(
			to bottom,
			transparent 0,
			#000 140px,
			#000 calc(100% - 140px),
			transparent 100%
		);
		mask-image: linear-gradient(
			to bottom,
			transparent 0,
			#000 140px,
			#000 calc(100% - 140px),
			transparent 100%
		);
	}

	/*
		The section's own texture, in front of its ground and behind its
		content. Every one of these is gradients only — no images, no extra
		requests — and each is masked so it fades out well before the section
		edge rather than stopping at a line.
	*/
	.motif {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}

	/*
		Orbits. Centred on the tech globe rather than on the section, so the
		rings read as that sphere's own field instead of decoration that happens
		to be nearby.
	*/
	.motif-rings {
		--ring-gap: 74px;
		/* Measured, not guessed: the globe's centre within its section is
		   50% / 46.7% once the layout is stacked. */
		--motif-x: 50%;
		--motif-y: 47%;
		background: repeating-radial-gradient(
			circle at var(--motif-x) var(--motif-y),
			transparent 0 calc(var(--ring-gap) - 1px),
			var(--motif-line) calc(var(--ring-gap) - 1px) var(--ring-gap)
		);
		-webkit-mask-image: radial-gradient(
			closest-side circle at var(--motif-x) var(--motif-y),
			#000 32%,
			transparent 88%
		);
		mask-image: radial-gradient(
			closest-side circle at var(--motif-x) var(--motif-y),
			#000 32%,
			transparent 88%
		);
	}

	/* A matrix, for a section that is itself a grid of cards. */
	.motif-dots {
		background-image: radial-gradient(var(--motif-dot) 1px, transparent 1.5px);
		background-size: 26px 26px;
		-webkit-mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 74%, transparent);
		mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 74%, transparent);
	}

	/*
		A duotone leaning one way then the other, for the two-sided Flutter vs
		SvelteKit comparison — the ground takes the same side each card argues.
	*/
	.motif-split {
		/* Mixed from the brand colours directly rather than using the `-wash`
		   tokens, which are tuned for small fills and read as nothing at this
		   size. */
		background: linear-gradient(
			118deg,
			color-mix(in srgb, var(--flutter) 15%, transparent) 0%,
			transparent 44%,
			transparent 56%,
			color-mix(in srgb, var(--svelte) 15%, transparent) 100%
		);
	}

	/* Fine rules, for the web work — ruled paper, or the lines of a page. */
	.motif-scan {
		background: repeating-linear-gradient(
			to bottom,
			var(--motif-line) 0 1px,
			transparent 1px 28px
		);
		-webkit-mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 70%, transparent);
		mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 70%, transparent);
	}

	/* Ambient bloom sits behind content and never intercepts pointer events. */
	.section.ambient::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--ambient);
		pointer-events: none;
		z-index: 0;
	}

	.shell {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: var(--maxw);
		margin-inline: auto;
		padding-inline: var(--gutter);
	}

	.head {
		margin-bottom: clamp(2rem, 5vw, 3.5rem);
	}

	.rule {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		margin-bottom: var(--sp-5);
	}

	.index {
		font-family: var(--font-display);
		font-size: var(--fs-eyebrow);
		font-weight: 700;
		letter-spacing: 0.08em;
		/* `-ink` rather than `--accent`: the raw brand orange is only 3.5:1 on a
		   light ground. The ink variant is darkened for light mode and lightened
		   for dark, so accent text clears 4.5:1 in both. */
		color: var(--accent-ink);
		font-variant-numeric: tabular-nums;
	}

	.eyebrow {
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		white-space: nowrap;
	}

	.line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, var(--line-strong), transparent);
	}

	.aside {
		flex-shrink: 0;
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--fs-h2);
		font-weight: 700;
		line-height: var(--lh-snug);
		letter-spacing: var(--tracking-head);
		max-width: 20ch;
	}

	.lead {
		margin-top: var(--sp-5);
		max-width: var(--maxw-prose);
		font-size: var(--fs-lead);
		color: var(--text-muted);
	}

	@media (min-width: 768px) {
		.rule {
			gap: var(--sp-5);
		}
	}

	/* Once the layout goes two-column the globe moves to the left, and the
	   rings have to follow it to keep looking deliberate. Measured at 1440px:
	   27.1% / 64.4%. */
	@media (min-width: 860px) {
		.motif-rings {
			--motif-x: 27%;
			--motif-y: 64%;
			--ring-gap: 88px;
		}
	}
</style>
