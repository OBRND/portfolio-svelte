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
		/** `inset` paints the sunken ground used to separate adjacent sections. */
		tone?: 'plain' | 'inset';
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
		ambient = false,
		class: className = '',
		children,
		aside
	}: Props = $props();
</script>

<div class="section {tone} {className}" class:ambient>
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
		background: var(--bg);
		color: var(--text);
	}

	.section.inset {
		background: var(--bg-inset);
	}

	/* Ambient bloom sits behind content and never intercepts pointer events. */
	.section.ambient::before {
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
</style>
