<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { progress } from '$lib/motion/scroll';

	/**
	 * Written for the person paying for the build, not for another developer:
	 * no framework vocabulary, just what each choice gets them. One promise and
	 * four plain outcomes per tool; the two halves do the rest visually.
	 */
	const tools = [
		{
			key: 'flutter',
			domain: 'Mobile',
			name: 'Flutter',
			verdict: 'Build it once. It runs on every phone.',
			payoffs: [
				'You pay for one app, not two',
				'iPhone and Android users get it the same day',
				'It looks and feels the same for everyone',
				'Stays quick, even on older phones'
			],
			glyph:
				'M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z'
		},
		{
			key: 'svelte',
			domain: 'Web',
			name: 'SvelteKit',
			verdict: 'Pages that open the moment you tap.',
			payoffs: [
				'Fast pages, so visitors stay',
				'Google can read every page, so people find you',
				'Works on slow connections too',
				'Simple to change later, so updates cost less'
			],
			glyph:
				'M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z'
		}
	] as const;
</script>

<!--
	Two halves that arrive from opposite sides as the section scrolls in (the
	`--p` scrub), then behave like one object: hover either and it takes room
	from the other.
-->
<section class="tools" use:progress={{ mode: 'enter' }} data-mood="split">
	<header class="head u-shell">
		<span class="u-label">Why these two</span>
		<h2 class="title u-lines" data-reveal use:reveal>
			<span class="u-line"><span>Two tools,</span></span>
			<span class="u-line"><span>picked for <span class="u-serif">you.</span></span></span>
		</h2>
	</header>

	<div class="halves u-shell">
		{#each tools as tool, i}
			<article class="half theme-{tool.key} side-{i}">
				<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true"><path d={tool.glyph} /></svg>

				<div class="half-top">
					<span class="u-label">{tool.domain}</span>
					<span class="u-label">0{i + 1}</span>
				</div>

				<h3 class="name">{tool.name}</h3>
				<p class="verdict u-serif">{tool.verdict}</p>

				<ul class="payoffs">
					{#each tool.payoffs as payoff}
						<li>{payoff}</li>
					{/each}
				</ul>
			</article>
		{/each}
	</div>
</section>

<style>
	.tools {
		--p: 0;
		/* Arrival is complete two-thirds of the way up the viewport. */
		--e: clamp(0, calc(var(--p) * 1.5), 1);
		position: relative;
		padding-block: var(--section-y);
		overflow: hidden;
	}

	/* Each tool's own light behind its half. (The cards used to blur what was
	   behind them; over a sky with no detail in it that cost a great deal on
	   a phone and changed nothing you could see.) */
	.tools::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			radial-gradient(46% 52% at 14% 66%, color-mix(in srgb, var(--azure) 26%, transparent), transparent 72%),
			radial-gradient(46% 52% at 86% 66%, color-mix(in srgb, var(--ember) 26%, transparent), transparent 72%);
		-webkit-mask-image: linear-gradient(to bottom, transparent, #000 30%, #000 80%, transparent);
		mask-image: linear-gradient(to bottom, transparent, #000 30%, #000 80%, transparent);
		opacity: var(--e);
		pointer-events: none;
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

	.halves {
		display: grid;
		gap: var(--sp-4);
	}

	.half {
		position: relative;
		display: grid;
		align-content: space-between;
		gap: var(--sp-6);
		min-height: clamp(22rem, 56svh, 36rem);
		padding: clamp(1.25rem, 2.6vw, 2.25rem);
		border: 1px solid var(--accent-edge);
		border-radius: var(--r-lg);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--accent) 20%, transparent),
			color-mix(in srgb, var(--accent) 5%, transparent) 70%
		);
		overflow: hidden;
		opacity: var(--e);
		transition:
			flex-grow 900ms var(--ease-out),
			background-color var(--dur-slow) ease;
	}

	.side-0 {
		transform: translate3d(calc((1 - var(--e)) * -14vw), 0, 0);
	}

	.side-1 {
		transform: translate3d(calc((1 - var(--e)) * 14vw), 0, 0);
	}

	.glyph {
		position: absolute;
		right: -6%;
		bottom: -12%;
		width: min(58%, 26rem);
		height: auto;
		max-width: none;
		fill: var(--accent);
		opacity: 0.16;
		transform: rotate(-8deg);
		transition:
			transform 1200ms var(--ease-out),
			opacity var(--dur-slow) ease;
		pointer-events: none;
	}

	.half:hover .glyph {
		transform: rotate(0deg) scale(1.08);
		opacity: 0.3;
	}

	.half-top {
		position: relative;
		display: flex;
		justify-content: space-between;
	}

	.half-top .u-label {
		color: var(--accent-ink);
	}

	.name {
		position: relative;
		font-size: clamp(3.4rem, 9vw, 9.5rem);
		font-weight: 300;
		font-stretch: 75%;
		line-height: 0.82;
		letter-spacing: -0.03em;
		transition: font-weight 600ms var(--ease-out);
	}

	.half:hover .name {
		font-weight: 600;
	}

	.verdict {
		position: relative;
		max-width: 18ch;
		font-size: clamp(1.6rem, 2.6vw, 2.4rem);
		line-height: 1.05;
		color: var(--accent-ink);
		margin-top: -0.6rem;
	}

	.payoffs {
		position: relative;
		list-style: none;
		display: grid;
	}

	.payoffs li {
		padding-block: 0.7rem;
		border-top: 1px solid var(--accent-edge);
		font-size: var(--fs-body);
		letter-spacing: -0.015em;
		color: var(--text);
	}

	@media (min-width: 860px) {
		.halves {
			display: flex;
		}

		.half {
			flex: 1 1 0;
			min-width: 0;
		}

		.half:hover {
			flex-grow: 1.45;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.half {
			opacity: 1;
			transform: none;
		}
	}
</style>
