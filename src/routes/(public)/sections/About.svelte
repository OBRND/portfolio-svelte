<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { reveal } from '$lib/actions/reveal';

	const avatar = $derived($theme === 'dark' ? '/ob.webp' : '/ob1.webp');

	const socialLinks = [
		{
			label: 'GitHub',
			href: 'https://github.com/OBRND',
			path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'
		},
		{
			label: 'LinkedIn',
			href: 'https://linkedin.com/in/yourusername',
			path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
		},
		{
			label: 'Telegram',
			href: 'https://t.me/OBDREAMER',
			path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'
		},
		{
			label: 'Email',
			href: 'mailto:obsannew@gmail.com',
			path: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z'
		}
	];

	/** Drawn from the published project list — no rounded-up claims. */
	const stats = [
		{ value: '5', label: 'Products shipped' },
		{ value: '3', label: 'Platforms targeted' },
		{ value: '2022', label: 'Building since' }
	];
</script>

<header class="hero">
	<div class="shell">
		<div class="hero-grid">
			<div class="hero-copy">
				<p class="status" data-reveal use:reveal={{ y: 12 }}>
					<span class="pulse" aria-hidden="true"></span>
					Software Engineer · Addis Ababa, Ethiopia
				</p>

				<h1 class="name" data-reveal use:reveal={{ y: 26, delay: 60 }}>Obsan Diribsa</h1>

				<p class="pitch" data-reveal use:reveal={{ y: 24, delay: 120 }}>
					I build cross-platform apps in <span class="hl flutter">Flutter</span> and fast,
					server-rendered web apps in <span class="hl svelte">SvelteKit</span>.
				</p>

				<p class="lead" data-reveal use:reveal={{ y: 20, delay: 180 }}>
					Five production products across delivery, fintech, nutrition and family planning,
					designed, built and released to real users on Android, iOS and the web.
				</p>

				<div class="actions" data-reveal use:reveal={{ y: 18, delay: 240 }}>
					<a class="btn primary" href="/Obsan Diribsa CV.pdf" download="Obsan Diribsa CV.pdf">
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7,10 12,15 17,10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						Download CV
					</a>

					<a class="btn ghost" href="#projects">
						See the work
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</a>
				</div>

				<ul class="socials" data-reveal use:reveal={{ y: 16, delay: 300 }}>
					{#each socialLinks as link}
						<li>
							<a
								href={link.href}
								target={link.href.startsWith('mailto:') ? null : '_blank'}
								rel="noopener noreferrer"
								aria-label={link.label}
							>
								<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
									<path d={link.path} />
								</svg>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="hero-portrait" data-reveal use:reveal={{ y: 28, scale: 0.94, delay: 120 }}>
				<div class="portrait-frame">
					<img src={avatar} alt="Obsan Diribsa" width="420" height="420" fetchpriority="high" />
				</div>
			</div>
		</div>

		<dl class="stats" data-reveal use:reveal={{ y: 20, delay: 360 }}>
			{#each stats as stat}
				<div class="stat">
					<dt>{stat.label}</dt>
					<dd>{stat.value}</dd>
				</div>
			{/each}
		</dl>
	</div>
</header>

<div class="about">
	<div class="shell">
		<div class="about-grid">
			<div class="about-head" data-reveal use:reveal={{ y: 20 }}>
				<span class="eyebrow">About</span>
				<h2>How I got here</h2>
			</div>

			<div class="about-body">
				<p data-reveal use:reveal={{ y: 18, delay: 60 }}>
					I've been drawn to technology from an early age. Growing up in Addis Ababa, where tech
					lagged behind, I saw both the need and the potential for change.
				</p>
				<p data-reveal use:reveal={{ y: 18, delay: 120 }}>
					That pushed me toward a career in it. I studied Software Engineering at Mekelle
					University, then moved straight into building real-world solutions rather than
					exercises.
				</p>
				<p data-reveal use:reveal={{ y: 18, delay: 180 }}>
					What I care about is the part users actually feel: interfaces that respond instantly,
					flows that don't break on a bad connection, and products that keep working once the
					launch excitement is over.
				</p>
				<p data-reveal use:reveal={{ y: 18, delay: 240 }}>
					Away from the keyboard I read, train, draw and paint. It resets my attention, and a
					surprising number of fixes arrive halfway through a drawing.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.shell {
		width: 100%;
		max-width: var(--maxw);
		margin-inline: auto;
		padding-inline: var(--gutter);
	}

	/* ---- Hero ------------------------------------------------------------ */

	.hero {
		position: relative;
		padding-top: clamp(3rem, 8vw, 6rem);
		padding-bottom: var(--section-y);
		background: var(--bg);
		overflow: hidden;
	}

	.hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--ambient);
		pointer-events: none;
	}

	.hero .shell {
		position: relative;
		z-index: 1;
	}

	.hero-grid {
		display: grid;
		gap: clamp(2rem, 6vw, 4rem);
		align-items: center;
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.35rem 0.9rem 0.35rem 0.7rem;
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		background: var(--bg-elev-1);
		font-size: var(--fs-xs);
		font-weight: 500;
		color: var(--text-muted);
		margin-bottom: var(--sp-5);
	}

	.pulse {
		position: relative;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--ok);
		flex-shrink: 0;
	}

	.pulse::after {
		content: '';
		position: absolute;
		inset: -4px;
		border-radius: 50%;
		border: 1px solid var(--ok);
		opacity: 0;
		animation: ping 2.4s var(--ease-out) infinite;
	}

	@keyframes ping {
		0% {
			opacity: 0.7;
			transform: scale(0.6);
		}
		70%,
		100% {
			opacity: 0;
			transform: scale(1.5);
		}
	}

	.name {
		font-family: var(--font-display);
		font-size: var(--fs-display);
		font-weight: 700;
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-display);
	}

	.pitch {
		margin-top: var(--sp-4);
		font-family: var(--font-display);
		font-size: var(--fs-h3);
		font-weight: 500;
		line-height: 1.35;
		letter-spacing: -0.01em;
		color: var(--text);
		max-width: 24ch;
	}

	/* Brand words are marked with a soft underline rather than coloured text,
	   which keeps contrast intact in both themes. */
	.hl {
		position: relative;
		white-space: nowrap;
	}

	.hl::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.02em;
		height: 0.32em;
		border-radius: 2px;
		z-index: -1;
	}

	.hl.flutter::after {
		background: var(--flutter-wash);
		box-shadow: inset 0 -1px 0 var(--flutter-edge);
	}

	.hl.svelte::after {
		background: var(--svelte-wash);
		box-shadow: inset 0 -1px 0 var(--svelte-edge);
	}

	.lead {
		margin-top: var(--sp-5);
		max-width: 52ch;
		font-size: var(--fs-lead);
		color: var(--text-muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin-top: var(--sp-6);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.35rem;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		font-size: var(--fs-sm);
		font-weight: 600;
		text-decoration: none;
		transition:
			transform var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.btn.primary {
		background: var(--text);
		color: var(--bg);
	}

	.btn.ghost {
		border-color: var(--line-strong);
		color: var(--text-muted);
	}

	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--text-subtle);
	}

	.btn:hover {
		transform: translateY(-2px);
	}

	.btn svg {
		transition: transform var(--dur-base) var(--ease-out);
	}

	.btn.ghost:hover svg {
		transform: translateX(3px);
	}

	.btn.primary:hover svg {
		transform: translateY(2px);
	}

	.socials {
		display: flex;
		gap: 0.5rem;
		list-style: none;
		margin-top: var(--sp-6);
	}

	.socials a {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: var(--bg-elev-1);
		color: var(--text-muted);
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
	}

	.socials a:hover {
		background: var(--text);
		color: var(--bg);
		transform: translateY(-2px);
	}

	/* ---- Portrait -------------------------------------------------------- */

	.hero-portrait {
		justify-self: center;
		/* Mobile stacks the grid into one column — lead with the face rather
		   than making a visitor scroll past the whole pitch to see who it's
		   from. Desktop's two-column layout restores document order below. */
		order: -1;
	}

	.portrait-frame {
		position: relative;
		width: clamp(200px, 52vw, 340px);
		aspect-ratio: 1;
		border-radius: 50%;
		padding: 6px;
		background: linear-gradient(140deg, var(--flutter-edge), transparent 45%, var(--svelte-edge));
	}

	.portrait-frame::before {
		content: '';
		position: absolute;
		inset: -14%;
		border-radius: 50%;
		border: 1px dashed var(--line-strong);
		opacity: 0.6;
		animation: spin 34s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.portrait-frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
		background: var(--bg-inset);
	}

	:global(:root.dark) .portrait-frame img {
		box-shadow: var(--glow-flutter);
	}

	/* ---- Stats ----------------------------------------------------------- */

	.stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--sp-4);
		margin-top: clamp(2.5rem, 7vw, 4.5rem);
		padding-top: var(--sp-6);
		border-top: 1px solid var(--line);
	}

	.stat dt {
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: 0.35rem;
	}

	.stat dd {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 4vw, 2.25rem);
		font-weight: 700;
		letter-spacing: var(--tracking-head);
		font-variant-numeric: tabular-nums;
	}

	/* ---- About ----------------------------------------------------------- */

	.about {
		padding-block: var(--section-y);
		background: var(--bg-inset);
	}

	.about-grid {
		display: grid;
		gap: clamp(1.5rem, 4vw, 3rem);
	}

	.eyebrow {
		display: block;
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: var(--sp-3);
	}

	.about-head h2 {
		font-family: var(--font-display);
		font-size: var(--fs-h2);
		letter-spacing: var(--tracking-head);
	}

	.about-body {
		display: grid;
		gap: var(--sp-4);
	}

	.about-body p {
		color: var(--text-muted);
		font-size: var(--fs-lead);
		max-width: 62ch;
	}

	/* ---- Layout ---------------------------------------------------------- */

	@media (min-width: 860px) {
		.hero-grid {
			grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		}

		.hero-portrait {
			order: 0;
		}

		.about-grid {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.9fr);
		}

		.about-body {
			columns: 2;
			column-gap: var(--sp-7);
			display: block;
		}

		.about-body p + p {
			margin-top: var(--sp-4);
		}
	}
</style>
