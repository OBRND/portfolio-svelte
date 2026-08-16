<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import { reveal } from '$lib/actions/reveal';

	interface TechCase {
		key: 'flutter' | 'svelte';
		name: string;
		logo: string;
		logoAlt: string;
		verdict: string;
		/** My own reasons for reaching for it. */
		reasons: { title: string; body: string }[];
		/** The same choice, framed as what the client gets out of it. */
		payoffs: string[];
	}

	const cases: TechCase[] = [
		{
			key: 'flutter',
			name: 'Flutter',
			logo: '/flutter-logo.webp',
			logoAlt: 'Flutter',
			verdict: 'One Dart codebase compiled to two native apps.',
			reasons: [
				{
					title: 'It feels genuinely native',
					body: 'Flutter compiles down to real native code, so animations and scrolling stay smooth, even on older phones.'
				},
				{
					title: 'Screens are easy to reason about',
					body: 'The UI is built from simple, reusable pieces, so it is easy to look at a screen and know exactly what it will do.'
				},
				{
					title: 'I see changes instantly',
					body: 'Hot reload shows every tweak on the real screen right away, so I can polish details fast instead of guessing.'
				},
				{
					title: 'One toolkit, start to finish',
					body: 'Backend, storage and app store releases all fit into the same toolkit, so nothing gets bolted on halfway through.'
				}
			],
			payoffs: [
				'One build ships to iOS and Android together, on a single budget and timeline.',
				'The interface looks and feels the same on every device, so design review and QA only happen once.',
				'Backed by Google and used at scale by companies like BMW and Alibaba, so it stays easy to support and staff for years to come.'
			]
		},
		{
			key: 'svelte',
			name: 'SvelteKit',
			logo: '/svelte_logo.webp',
			logoAlt: 'Svelte',
			verdict: 'Compiled, server-rendered, and small by default.',
			reasons: [
				{
					title: 'It ships less to the browser',
					body: 'Svelte turns your app into small, plain JavaScript at build time, so pages show up and respond faster.'
				},
				{
					title: 'The code stays easy to follow',
					body: 'State is simple and explicit, so it is clear what changes and why, even months later.'
				},
				{
					title: 'It is a complete toolkit',
					body: 'Routing, server rendering and forms are all built in, so I am not wiring together a pile of separate libraries.'
				},
				{
					title: 'It respects the platform',
					body: 'It stays close to plain HTML and CSS, so accessibility and good performance come naturally rather than as an afterthought.'
				}
			],
			payoffs: [
				'Pages are server-rendered and fast, so search ranking and load times hold up without extra work.',
				'Forms and key flows still work even before JavaScript finishes loading, so you do not quietly lose visitors.',
				'Less code to maintain means cheaper changes, and it is easier for a second developer to jump in.'
			]
		}
	];
</script>

<Section
	index="02"
	eyebrow="Stack rationale"
	title="Why I build with Flutter and SvelteKit"
	lead="Two tools, chosen for different jobs. Here is why I reach for each one, in plain terms, and what that choice is actually worth to whoever is paying for the build."
	tone="inset"
	fadeIn
	motif="split"
>
	<div class="grid">
		{#each cases as item, cardIndex}
			<article
				class="card theme-{item.key}"
				data-reveal
				use:reveal={{ y: 32, delay: cardIndex * 90 }}
			>
				<header class="head">
					<img class="logo" src={item.logo} alt={item.logoAlt} width="52" height="52" loading="lazy" />
					<div>
						<h3 class="name">{item.name}</h3>
						<p class="verdict">{item.verdict}</p>
					</div>
				</header>

				<div class="group">
					<h4 class="group-title">
						<span class="dot" aria-hidden="true"></span>
						Why I choose it
					</h4>
					<ol class="reasons">
						{#each item.reasons as reason, i}
							<li>
								<span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
								<div>
									<h5>{reason.title}</h5>
									<p>{reason.body}</p>
								</div>
							</li>
						{/each}
					</ol>
				</div>

				<div class="group">
					<h4 class="group-title">
						<span class="dot" aria-hidden="true"></span>
						What it's worth to you
					</h4>
					<ul class="payoffs">
						{#each item.payoffs as payoff}
							<li>
								<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="m5 13 4 4L19 7" />
								</svg>
								<span>{payoff}</span>
							</li>
						{/each}
					</ul>
				</div>
			</article>
		{/each}
	</div>
</Section>

<style>
	.grid {
		display: grid;
		gap: clamp(1.25rem, 3vw, 2rem);
	}

	.card {
		display: flex;
		flex-direction: column;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		background: var(--bg-elev-1);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out);
		position: relative;
		overflow: hidden;
	}

	/* A hairline of the platform colour along the top edge, the only place the
	   brand colour is used at full strength, so the two cards stay legible as a
	   pair rather than competing. */
	.card::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 2px;
		background: linear-gradient(90deg, var(--accent), transparent 70%);
	}

	.card:hover {
		transform: translateY(-3px);
		border-color: var(--accent-edge);
		box-shadow: var(--shadow-md);
	}

	:global(:root.dark) .card:hover {
		box-shadow: var(--shadow-md), var(--accent-glow);
	}

	.head {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		padding-bottom: var(--sp-5);
		margin-bottom: var(--sp-5);
		border-bottom: 1px solid var(--line);
	}

	.logo {
		width: clamp(38px, 8vw, 52px);
		height: auto;
		object-fit: contain;
		flex-shrink: 0;
	}

	.name {
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 3vw, 1.75rem);
		letter-spacing: var(--tracking-head);
		line-height: 1.1;
	}

	.verdict {
		margin-top: 0.25rem;
		font-size: var(--fs-sm);
		/* `-ink` keeps accent-coloured text above 4.5:1 in both themes; raw
		   `--accent` is only 3.5:1 for the orange on a light ground. */
		color: var(--accent-ink);
		font-weight: 500;
	}

	.group + .group {
		margin-top: var(--sp-6);
		padding-top: var(--sp-6);
		border-top: 1px solid var(--line);
	}

	.group-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-body);
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: var(--sp-4);
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		flex-shrink: 0;
	}

	.reasons {
		list-style: none;
		display: grid;
		gap: var(--sp-4);
	}

	.reasons li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--sp-3);
	}

	.num {
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 700;
		color: var(--accent-ink);
		font-variant-numeric: tabular-nums;
		padding-top: 0.15rem;
	}

	.reasons h5 {
		font-family: var(--font-body);
		font-size: var(--fs-sm);
		font-weight: 600;
		margin-bottom: 0.2rem;
	}

	.reasons p {
		font-size: var(--fs-sm);
		color: var(--text-muted);
	}

	.payoffs {
		list-style: none;
		display: grid;
		gap: var(--sp-3);
	}

	.payoffs li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
		color: var(--text-muted);
	}

	.payoffs svg {
		color: var(--accent-ink);
		margin-top: 0.3rem;
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: stretch;
		}
	}
</style>
