<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { reveal } from '$lib/actions/reveal';
	import Section from '$lib/components/ui/Section.svelte';
	import type ReactGlobe from '$lib/components/globe.svelte';

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
	 * Logos simple-icons does not carry, or carries only in the flat
	 * monochrome it mandates for brand-guideline reasons — Google Play's
	 * glyph there renders in dark grey, not the recognisable four-colour
	 * triangle, so it's supplied as an image instead like the others here.
	 */
	const customImageData = [
		{ src: '/java.svg', id: 'java', alt: 'Java Logo' },
		{ src: '/flutter_flow.webp', id: 'flutterflow', alt: 'FlutterFlow Logo' },
		{ src: '/hive.webp', id: 'hive-logo', alt: 'Hive Logo' },
		{ src: '/google-play.svg', id: 'googleplay', alt: 'Google Play Logo' }
	];

	/**
	 * Grouped rather than presented as one flat run of twenty-odd pills, a
	 * reader scanning for "does this person do backend" should find the answer
	 * in one glance instead of reading the whole list.
	 *
	 * `color` tints each group's row so the categories stay visually distinct
	 * on mobile once the heading collapses into an inline tag (see the
	 * `.group-tag` styles below) — Mobile and Web reuse the same brand tokens
	 * as the rest of the site, the others get a dedicated accent.
	 */
	const groups: { label: string; items: string[]; color: string }[] = [
		{
			label: 'Languages',
			items: ['Dart', 'JavaScript', 'TypeScript', 'Java', 'Python', 'C++'],
			color: '#64748b'
		},
		{
			label: 'Mobile',
			items: ['Flutter', 'FlutterFlow', 'Android Development', 'Hive'],
			color: 'var(--flutter)'
		},
		{
			label: 'Web',
			items: ['Svelte', 'SvelteKit', 'HTML', 'CSS'],
			color: 'var(--svelte)'
		},
		{
			label: 'Backend & data',
			items: ['Firebase', 'Supabase', 'PostgreSQL', 'SQLite', 'Google Cloud', 'Cloudinary'],
			color: '#0d9488'
		},
		{
			label: 'Tooling & delivery',
			items: ['Git', 'GitHub', 'Figma', 'Vercel', 'Google Play', 'App Store'],
			color: '#7c3aed'
		}
	];

	const techColors: Record<string, { primary: string; text: string }> = {
		Dart: { primary: '#0175C2', text: '#FFFFFF' },
		JavaScript: { primary: '#F7DF1E', text: '#323330' },
		TypeScript: { primary: '#3178C6', text: '#FFFFFF' },
		Java: { primary: '#007396', text: '#FFFFFF' },
		Python: { primary: '#3776AB', text: '#FFFFFF' },
		'C++': { primary: '#00599C', text: '#FFFFFF' },
		Flutter: { primary: '#02569B', text: '#FFFFFF' },
		FlutterFlow: { primary: '#492FDD', text: '#FFFFFF' },
		'Android Development': { primary: '#3DDC84', text: '#12321F' },
		Hive: { primary: '#FFC107', text: '#2C2100' },
		Svelte: { primary: '#FF3E00', text: '#FFFFFF' },
		SvelteKit: { primary: '#FF3E00', text: '#FFFFFF' },
		HTML: { primary: '#E34F26', text: '#FFFFFF' },
		CSS: { primary: '#1572B6', text: '#FFFFFF' },
		Firebase: { primary: '#FFCA28', text: '#2C3E50' },
		Supabase: { primary: '#3ECF8E', text: '#18181B' },
		PostgreSQL: { primary: '#4479A1', text: '#FFFFFF' },
		SQLite: { primary: '#003B57', text: '#FFFFFF' },
		'Google Cloud': { primary: '#4285F4', text: '#FFFFFF' },
		Git: { primary: '#F05033', text: '#FFFFFF' },
		GitHub: { primary: '#181717', text: '#FFFFFF' },
		Figma: { primary: '#F24E1E', text: '#FFFFFF' },
		Vercel: { primary: '#000000', text: '#FFFFFF' },
		Cloudinary: { primary: '#3448C5', text: '#FFFFFF' },
		/* Google's brand green, the same hex the triangle logo's green wedge
		   uses, rather than the flat grey the monochrome glyph elsewhere is
		   locked to. */
		'Google Play': { primary: '#34A853', text: '#0F2A1B' },
		'App Store': { primary: '#0D96F6', text: '#0F1E33' }
	};

	const slugToTechNameMap: Record<string, string> = {
		javascript: 'JavaScript',
		typescript: 'TypeScript',
		java: 'Java',
		python: 'Python',
		dart: 'Dart',
		flutter: 'Flutter',
		css3: 'CSS',
		android: 'Android Development',
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

	let ReactGlobeComponent = $state<typeof ReactGlobe | null>(null);
	let activeTechItem = $state<string | null>(null);
	let showClickHint = $state(true);
	let highlightTimer: ReturnType<typeof setTimeout> | null = null;

	function techColor(name: string) {
		return techColors[name]?.primary ?? 'var(--accent)';
	}

	function techText(name: string) {
		return techColors[name]?.text ?? '#ffffff';
	}

	function handleIconClick(identifier: string) {
		const techName = slugToTechNameMap[identifier];
		if (highlightTimer) clearTimeout(highlightTimer);
		activeTechItem = techName ?? null;
		if (!techName) return;
		highlightTimer = setTimeout(() => (activeTechItem = null), 1400);
	}

	onMount(async () => {
		const { default: LoadedReactGlobe } = await import('$lib/components/globe.svelte');
		ReactGlobeComponent = LoadedReactGlobe;
		return () => {
			if (highlightTimer) clearTimeout(highlightTimer);
		};
	});
</script>

<Section
	index="01"
	eyebrow="Toolkit"
	title="The stack I actually ship with"
	lead="Not a list of everything I have touched. These are the tools I use on real, released work, spin the cloud and tap an icon to find it in the list below."
	ambient
>
	<div class="layout">
		<div class="globe-side" data-reveal use:reveal={{ y: 24, scale: 0.96 }}>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div class="globe-area" onclick={() => (showClickHint = false)}>
				{#if ReactGlobeComponent}
					<ReactGlobeComponent
						iconSlugs={simpleIconSlugs}
						imageArray={customImageData}
						theme={$theme}
						onIconClick={handleIconClick}
					/>
				{:else}
					<div class="globe-placeholder" aria-hidden="true">
						<span class="orbit"></span>
						<span class="orbit"></span>
						<p>Loading toolkit…</p>
					</div>
				{/if}

				{#if showClickHint}
					<div class="hint" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="m9 11 4 9 2-6 6-2-12-5z" />
							<path d="M4 4 2 2M6 2v2M2 6h2" />
						</svg>
						<span class="on-desktop">Click an icon to find it in the list to the right</span>
						<span class="on-mobile">Tap an icon to find it below</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="stack-side">
			{#each groups as group, groupIndex}
				<!--
					On mobile `.group` collapses to `display: contents` so its pills
					join one continuous flowing row across every category instead of
					sitting in their own boxed-off section — a "|" divider marks each
					new category instead, coloured per group so the clusters still
					read apart at a glance. The heading stays screen-reader-only there;
					sighted users get the colour instead of the label. Desktop restores
					the original heading-above-pills layout untouched.
				-->
				<div
					class="group"
					data-reveal
					use:reveal={{ y: 18, delay: groupIndex * 70 }}
					style="--group-color: {group.color};"
				>
					<h3 class="group-label">{group.label}</h3>
					{#if groupIndex > 0}
						<span class="divider" aria-hidden="true">|</span>{' '}
					{/if}
					<ul class="pills">
						{#each group.items as item}
							<li
								class="pill"
								class:active={activeTechItem === item}
								style="--pill-bg:{techColor(item)}; --pill-fg:{techText(item)};"
							>
								{item}
							</li>{' '}
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</Section>

<style>
	.layout {
		display: grid;
		gap: clamp(2rem, 5vw, 3.5rem);
		align-items: start;
	}

	/* ---- Globe ----------------------------------------------------------- */

	.globe-side {
		position: relative;
		/* A little inset on mobile so the globe reads as a contained object
		   rather than stretching edge-to-edge, without eating too much into
		   its size. Desktop removes this — the two-column layout already
		   gives it room to breathe. */
		padding-inline: 0.5rem;
	}

	.globe-area {
		position: relative;
		width: 100%;
		max-width: 330px;
		margin-inline: auto;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		cursor: pointer;
	}

	.globe-placeholder {
		display: grid;
		place-items: center;
		gap: var(--sp-4);
		width: 100%;
		height: 100%;
		color: var(--text-subtle);
		font-size: var(--fs-xs);
	}

	.globe-placeholder .orbit {
		position: absolute;
		border: 1px dashed var(--line-strong);
		border-radius: 50%;
		opacity: 0.6;
	}
	.globe-placeholder .orbit:nth-child(1) {
		inset: 12%;
	}
	.globe-placeholder .orbit:nth-child(2) {
		inset: 28%;
		animation: drift 9s linear infinite;
	}

	@keyframes drift {
		to {
			transform: rotate(360deg);
		}
	}

	.hint {
		position: absolute;
		bottom: 2%;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.9rem;
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: color-mix(in srgb, var(--bg-elev-1) 82%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		color: var(--text-muted);
		font-size: var(--fs-xs);
		white-space: nowrap;
		box-shadow: var(--shadow-sm);
		animation: hint-in 600ms var(--ease-out) backwards;
	}

	@keyframes hint-in {
		from {
			opacity: 0;
			transform: translate(-50%, 8px);
		}
	}

	.hint svg {
		color: var(--accent);
		flex-shrink: 0;
	}

	.on-mobile {
		display: inline;
	}
	.on-desktop {
		display: none;
	}

	/* ---- Pills ----------------------------------------------------------- */

	/* Mobile: the groups read like wrapped text — each one an inline run
	   that flows into the next and wraps at the pill level, so space is
	   used as tightly as possible instead of stacking a block per group.
	   Justified rather than left-aligned so the ragged edge that comes from
	   variable-width chips is evened out, same as justified text — the last
	   (usually partial) line stays left-aligned rather than being stretched
	   into unnaturally wide gaps. */
	.stack-side {
		display: block;
		text-align: justify;
		text-align-last: left;
	}

	/*
		Visually hidden rather than `display:none`, so the category name is
		still announced to screen readers as a heading even though sighted
		users get the colour-coded divider and background band instead.
		Desktop undoes this and shows the heading normally.
	*/
	.group-label {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	/*
		An inline run rather than a block, so it wraps into the surrounding
		flow instead of forcing a line break before and after itself — that
		is what lets one category's tail share a line with the next one's
		start. `box-decoration-break: clone` re-applies the background,
		padding and radius to every wrapped fragment, so the tint still
		looks like one continuous band even where a category spans two
		lines. Desktop reverts this to a plain block below.
	*/
	.group {
		display: inline;
		background: color-mix(in srgb, var(--group-color) 24%, transparent);
		border-radius: var(--r-md);
		padding: 0.4rem 0.55rem;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
	}

	/* Marks the start of a new category inline, coloured to match its
	   section's background so the clusters stay identifiable without a
	   heading line. Skipped before the first group — nothing to divide
	   from yet. */
	.divider {
		display: inline;
		color: var(--group-color);
		font-weight: 700;
		font-size: 1.05em;
		margin-inline-end: 0.3rem;
	}

	.pills {
		display: inline;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* Same neutral chip as before the redesign — only the band underneath
	   (`.group`, above) carries the category colour now. */
	.pill {
		display: inline-flex;
		align-items: center;
		/* A touch more room than the chip's own padding gives, so
		   neighbouring pills read as separate rather than touching. */
		margin: 0 0.3rem 0.4rem 0;
		padding: 0.35rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		background: var(--bg-elev-1);
		color: var(--text-muted);
		font-size: var(--fs-xs);
		font-weight: 500;
		line-height: 1.5;
		cursor: default;
		transition:
			background-color var(--dur-base) var(--ease-out),
			color var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out),
			transform var(--dur-base) var(--ease-spring);
	}

	.pill:hover,
	.pill.active {
		background: var(--pill-bg);
		color: var(--pill-fg);
		border-color: var(--pill-bg);
		transform: translateY(-2px);
	}

	.pill.active {
		box-shadow: 0 6px 18px -6px var(--pill-bg);
	}

	/* ---- Layout ---------------------------------------------------------- */

	@media (min-width: 900px) {
		.layout {
			grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr);
			align-items: center;
		}

		.globe-side {
			padding-inline: 0;
		}

		.globe-area {
			max-width: 420px;
		}

		.stack-side {
			display: grid;
			gap: var(--sp-5);
			text-align: left;
		}

		/* Restore the plain heading-above-pills layout: the mobile flattening,
		   its divider and its background band step aside for the original,
		   quieter look. */
		.group {
			display: block;
			background: none;
			padding: 0;
		}

		.divider {
			display: none;
		}

		.pills {
			display: flex;
			flex-wrap: wrap;
			gap: 0.4rem;
		}

		.pill {
			margin: 0;
		}

		.group-label {
			position: static;
			width: auto;
			height: auto;
			margin: 0;
			overflow: visible;
			clip: auto;
			white-space: normal;
			font-family: var(--font-body);
			font-size: var(--fs-eyebrow);
			font-weight: 600;
			letter-spacing: var(--tracking-eyebrow);
			text-transform: uppercase;
			color: var(--text-subtle);
			margin-bottom: var(--sp-3);
			padding-bottom: var(--sp-2);
			border-bottom: 1px solid var(--line);
		}

		.on-mobile {
			display: none;
		}
		.on-desktop {
			display: inline;
		}
	}
</style>
