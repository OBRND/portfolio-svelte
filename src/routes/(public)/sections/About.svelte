<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { reveal } from '$lib/actions/reveal';
	import { ripple } from '$lib/actions/ripple';
	import { cursorGlow } from '$lib/actions/cursorGlow';
	import { cursorWake } from '$lib/actions/cursorWake';
	import { pointerOrbit } from '$lib/actions/pointerOrbit';

	const avatar = $derived($theme === 'dark' ? '/ob.webp' : '/ob1.webp');

	/**
	 * The two spheres orbiting the portrait. Glyphs are inlined rather than
	 * loaded from `static/` — the existing flutter/svelte logo files there are
	 * opaque-white-background webp, which would show as a white square at this
	 * size, and a single-path monochrome mark stays crisp at ~16px where the
	 * full-colour logo would just be mush.
	 */
	const orbits = [
		{
			id: 'flutter',
			path: 'M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z'
		},
		{
			id: 'svelte',
			path: 'M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z'
		}
	];

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

<header class="hero" use:cursorGlow use:cursorWake>
	<div class="shell">
		<div class="hero-grid">
			<div class="hero-copy">
				<p class="status" data-reveal use:reveal={{ y: 12 }}>
					<span class="pulse" aria-hidden="true"></span>
					Software Engineer · Addis Ababa, Ethiopia
				</p>

				<h1 class="name">
					<span class="word" data-reveal use:reveal={{ y: 36, delay: 40 }}>Obsan</span>{' '}
					<span class="word" data-reveal use:reveal={{ y: 36, delay: 160 }}>Diribsa</span>
				</h1>

				<p class="pitch" data-reveal use:reveal={{ y: 24, delay: 120 }}>
					I build cross-platform apps in <span class="hl flutter">Flutter</span> and fast,
					server-rendered web apps in <span class="hl svelte">SvelteKit</span>.
				</p>

				<!--
					Deliberately carries no count and no platform list: the stat row a
					few elements below already states both, and the pitch above already
					names the frameworks. The space goes to the one thing nothing else
					on the page says — that the work is the platform as well as the
					client, and that the design of it is his. The project list bears
					that out: Fro ships as an app, a marketing site and an ops console;
					Van It as a customer app and a driver-side fleet tool.
				-->
				<p class="lead" data-reveal use:reveal={{ y: 20, delay: 180 }}>
					I design the systems these apps run on, not just the screens: the data model and
					services underneath, the customer and operator apps and the admin console on top. On
					most projects the blueprint is mine as well.
				</p>

				<div class="actions" data-reveal use:reveal={{ y: 18, delay: 240 }}>
					<a class="btn primary" href="/Obsan Diribsa CV.pdf" download="Obsan Diribsa CV.pdf" use:ripple>
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7,10 12,15 17,10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						Download CV
					</a>

					<a class="btn ghost" href="#projects" use:ripple>
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
				<!--
					Carries the slow sway. Kept separate from .portrait-frame so it
					does not fight the cursor tilt written onto that element.
				-->
				<div class="portrait-stage">
					<div class="portrait-frame" use:pointerOrbit={{ max: 7, reach: 2.4, swirl: 0.35 }}>
						<!--
							Two tilted orbits sharing one 3D space with the photo, each
							carrying a small brand sphere that genuinely passes behind
							the portrait at the top of its arc and in front at the
							bottom. See the `.orbit` styles below for the geometry.
						-->
						{#each orbits as orbit}
							<div class="orbit orbit-{orbit.id}" aria-hidden="true">
								<!-- The plane's own tilt and precession; the wrapper above it
								     carries only the cursor's swirl. -->
								<div class="orbit-plane">
									<span class="trail-clip clip-back">
										<span class="trail-spin"><span class="trail-ring"></span></span>
									</span>
									<span class="trail-clip clip-front">
										<span class="trail-spin"><span class="trail-ring"></span></span>
									</span>
									<span class="spinner">
										<span class="arm">
											<span class="planet">
												<span class="planet-face">
													<svg viewBox="0 0 24 24" aria-hidden="true">
														<path d={orbit.path} />
													</svg>
												</span>
											</span>
										</span>
									</span>
								</div>
							</div>
						{/each}
						<img src={avatar} alt="Obsan Diribsa" width="420" height="420" fetchpriority="high" />
					</div>
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
		overflow: hidden;
	}

	/*
		A window onto the pinned substrate in the public layout: no ground of its
		own, and no ambient bloom either, since that layer already carries both.
		The blueprint grid showing through here is the first thing a visitor
		sees, which is the point — and it holds still while the hero scrolls
		off it.
	*/

	/* Soft glow that trails the cursor, driven by src/lib/actions/cursorGlow.ts
	   setting --glow-x/--glow-y/--glow-opacity. Its own layer rather than
	   folded into .hero::before above, since that pseudo-slot is already the
	   fixed ambient wash. --accent-wash keeps the colour on-theme in both
	   light/dark and under the flutter/svelte scoping classes. */
	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			480px circle at var(--glow-x, 50%) var(--glow-y, 50%),
			var(--accent-wash),
			transparent 70%
		);
		opacity: var(--glow-opacity, 0);
		transition: opacity 500ms var(--ease-out);
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

	.name .word {
		display: inline-block;
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

	.btn:active {
		transform: translateY(0) scale(0.97);
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
		/* The 3D scene the orbits and the portrait share. Set as a property
		   here rather than a perspective() function on the frame so it
		   applies to the whole subtree at one consistent vanishing point. */
		perspective: 1100px;
	}

	/*
		Turns the whole system — photo and both orbits together — rather than
		leaving the portrait sitting still while things move around it. A slow
		bounded sway instead of a full revolution: a portrait rotated past
		~15° starts to read as a flat card edge-on rather than a solid, and
		the face is the one thing here that should never look like a texture
		on a spinning plane.
	*/
	.portrait-stage {
		transform-style: preserve-3d;
		animation: portrait-sway 22s ease-in-out infinite;
	}

	@keyframes portrait-sway {
		0%,
		100% {
			transform: rotateY(-9deg) rotateX(2.5deg);
		}
		50% {
			transform: rotateY(9deg) rotateX(-2.5deg);
		}
	}

	.portrait-frame {
		--frame-size: clamp(200px, 52vw, 340px);
		/* Half the orbit box below (`inset: -14%` → 128% of the frame), so the
		   spheres land exactly on their drawn arcs. */
		--orbit-r: calc(var(--frame-size) * 0.64);
		/* The box the halo falls off inside — larger than the old solid ball,
		   but reads smaller since only the mark at ~44% of it is opaque. */
		--planet-size: clamp(19px, 4.8vw, 25px);
		position: relative;
		width: var(--frame-size);
		aspect-ratio: 1;
		border-radius: 50%;
		padding: 6px;
		/*
			Neutral rather than the old flutter-to-svelte gradient. That ring
			put a static blue arc at the top-left and a warm one at the
			bottom-right, which read as brand-coloured glow competing with the
			orbits — so whenever a sphere was on the opposite side from its own
			colour's arc, the pair looked a full half-turn out of step. The
			only brand colour around the portrait now belongs to the trails.
		*/
		background: linear-gradient(140deg, var(--line-strong), transparent 45%, var(--line-strong));
		/* Cursor-follow turn (src/lib/actions/pointerOrbit.ts, desktop only).
		   The perspective comes from .hero-portrait's own `perspective`
		   property rather than a perspective() function here, so the orbits
		   below share one 3D space with this frame instead of each getting
		   their own flattened one.

		   No transition: the action springs these values itself and writes
		   them once per frame. Handing the same job to a CSS transition means
		   every pointermove interrupts the previous one mid-flight, which is
		   what made this judder. `will-change` then keeps the layer up rather
		   than letting it be promoted and dropped around each burst of
		   movement. */
		transform: rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg));
		transform-style: preserve-3d;
		will-change: transform;
	}

	/*
		Two tilted orbits, each a circle lying in its own plane, carrying one
		small brand sphere.

		Geometry: the orbit plane is tilted `--tx` about X, so a point at
		angle s on the circle lands at screen y = -R·cos(s)·cos(tx) with
		depth z = -R·cos(s)·sin(tx). The top of the arc therefore sits at
		negative z (behind the photo) and the bottom at positive z (in front),
		which is what makes the sphere disappear behind the head and re-emerge
		across the chest. `--tz` then leans the whole ellipse in-screen.

		The arcs are split into two halves rather than drawn as one ring
		because Chrome depth-sorts whole elements, not per-pixel plane
		intersections: a full ring straddles z=0, ties with the photo, and
		ends up drawn entirely over it. Splitting at y=0 — exactly where the
		orbit plane crosses the photo plane — puts each half wholly on one
		side, so both sort correctly and the ring itself is occluded too.
	*/
	/*
		Outer shell: geometry plus whatever swing the cursor has put into the
		system. Kept separate from the plane below because that one is driven
		by a CSS animation, and an animation owns the whole `transform` — there
		is no room in it for a value script is also writing.

		Z again, for the same reason the precession is: it is the one axis that
		leaves every element's depth untouched, so the halves below stay sorted
		against the photo no matter how hard the orbits are swung.
	*/
	.orbit {
		position: absolute;
		inset: -14%;
		transform-style: preserve-3d;
		pointer-events: none;
		transform: rotateZ(var(--orbit-spin, 0deg));
		/* The cold end of the trail: the brand colour pulled most of the way
		   to neutral, so the path never disappears entirely — it just cools
		   to a grey ember once the sphere's energy has bled off. */
		--trail-grey: color-mix(in srgb, var(--orbit-color) 40%, var(--text-subtle));
		--trail-floor: color-mix(in srgb, var(--trail-grey) 32%, transparent);
	}

	.orbit-plane {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
		transform: rotateZ(var(--tz)) rotateX(var(--tx));
		animation: orbit-precess var(--precess) linear infinite;
	}

	/*
		Swings the whole orbital plane around the portrait, on top of the
		sphere's own travel along it.

		Deliberately a Z rotation. The depth split that makes everything
		occlude correctly relies on the plane meeting the photo's plane
		exactly at local y=0 — true because the tilt leaves z = y·sin(tx),
		and a Z rotation never touches z. Precessing about Y instead would
		swing that crossing line away from y=0, and the static half-clips
		would stop matching it, breaking the occlusion at most angles.
	*/
	@keyframes orbit-precess {
		from {
			transform: rotateZ(var(--tz)) rotateX(var(--tx));
		}
		to {
			transform: rotateZ(calc(var(--tz) + 360deg)) rotateX(var(--tx));
		}
	}

	.orbit-flutter {
		--tz: -18deg;
		--tx: 58deg;
		--period: 15s;
		--precess: 38s;
		--orbit-color: var(--flutter);
		/* Flutter's own brand navy — 7.7:1 on the orb's light core. */
		--mark: #02569b;
	}

	.orbit-svelte {
		--tz: 24deg;
		--tx: 63deg;
		--period: 21s;
		--precess: 53s;
		--orbit-color: var(--svelte);
		/* Svelte's flame red, deepened a little: the stock #ff3e00 only
		   manages ~3.2:1 against the core at this size. */
		--mark: #d33500;
	}

	/*
		The lit trail. The path itself is unpainted — only the ~100° arc the
		sphere is currently sweeping is visible, brightest at the sphere with
		a short glow thrown ahead of it and a tail fading out behind, so the
		orbit is repeatedly relit and left to fade as the sphere comes round.

		`overflow: hidden` is doing real work here beyond clipping: it forces
		a flattening context, which is what lets a *rotating* ring live
		inside a *static* half-box. The half-box is what gets depth-sorted
		(same split as before — top half behind the photo, bottom half in
		front), while the gradient sweeps freely inside it. Rotating the ring
		directly instead would put a full circle straddling z=0 back into the
		sort, and it would draw over the portrait again.
	*/
	.trail-clip {
		position: absolute;
		left: 0;
		width: 100%;
		height: 50%;
		overflow: hidden;
	}

	.clip-back {
		top: 0;
	}

	.clip-front {
		bottom: 0;
	}

	/*
		Carries the sweep, so the painted ring below can stay still.

		That split matters: a mask and a drop-shadow both force their own
		render surface, and applying them to the element that is *also*
		rotating makes the browser redo the mask and the filter every single
		frame on the main thread. Rotating an unpainted wrapper instead lets
		the ring rasterise once and simply be transformed — and it removes the
		per-frame mask pass that could otherwise miss a frame and flash the
		unmasked disc, whose bright head is a full-radius wedge (the thin
		brand-coloured spike from the middle of the portrait out to the ring).

		The origin is pushed to the clip's edge because that edge, not the
		half-box's own centre, is where the orbit's centre lies.
	*/
	.trail-spin {
		position: absolute;
		inset: 0;
		animation: orbit-rot var(--period) linear infinite;
		will-change: transform;
	}

	.clip-back .trail-spin {
		transform-origin: 50% 100%;
	}

	.clip-front .trail-spin {
		transform-origin: 50% 0;
	}

	.orbit-svelte .trail-spin {
		animation-direction: reverse;
	}

	/* Spans the full orbit circle; each clip reveals its own half of it. */
	.trail-ring {
		position: absolute;
		left: 0;
		width: 100%;
		height: 200%;
		border-radius: 50%;
		/* Cuts the painted disc down to a hairline ring. */
		-webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
		mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
		filter: drop-shadow(0 0 3px color-mix(in srgb, var(--orbit-color) 55%, transparent));
	}

	.clip-back .trail-ring {
		top: 0;
	}

	.clip-front .trail-ring {
		bottom: 0;
	}

	/*
		Head sits on the 0/360 seam so it is continuous, and the sphere rides
		exactly on it.

		Proportions: the tail runs the full 270° behind the head — the orbit
		is charged to full brightness as the sphere passes and bleeds that
		energy off steadily all the way round, hitting zero a quarter-turn
		before the sphere next reaches it. Only that ~88° stretch immediately
		ahead is truly dark. The lead glow is deliberately tiny at ~2°: at
		this radius that is ~7px of arc, about half the sphere's own glowing
		radius, so it reads as light spilling just in front of it rather than
		as a second wedge.
	*/
	/*
		Falloff is deliberately steep right behind the head — most of the
		brightness is spent within ~25° — then a long faint ember out to the
		full 270°.

		A gentler, more even ramp reads wrong here because the orbit plane is
		tilted 58°: near the ellipse's left and right extremes the ring is
		foreshortened to about half its arc-length-per-degree, while the top
		and bottom stretch out. An even ramp therefore puts far more *screen*
		length under the mid-tail than under the head, and the eye picks that
		bright band as the comet, leaving the sphere looking stranded at the
		wrong end of it. Concentrating the light keeps the head visually
		pinned to the sphere wherever it is on the ellipse.
	*/
	.orbit-flutter .trail-ring {
		background: conic-gradient(
			from 0deg,
			color-mix(in srgb, var(--orbit-color) 95%, transparent) 0deg,
			var(--trail-floor) 5deg,
			var(--trail-floor) 100deg,
			color-mix(in srgb, var(--orbit-color) 14%, transparent) 160deg,
			color-mix(in srgb, var(--orbit-color) 26%, transparent) 220deg,
			color-mix(in srgb, var(--orbit-color) 42%, transparent) 275deg,
			color-mix(in srgb, var(--orbit-color) 62%, transparent) 320deg,
			color-mix(in srgb, var(--orbit-color) 82%, transparent) 348deg,
			color-mix(in srgb, var(--orbit-color) 95%, transparent) 360deg
		);
	}

	/* Mirrored stop order, because this orbit runs anticlockwise — the tail
	   has to fall on the other side of the head. */
	.orbit-svelte .trail-ring {
		background: conic-gradient(
			from 0deg,
			color-mix(in srgb, var(--orbit-color) 95%, transparent) 0deg,
			color-mix(in srgb, var(--orbit-color) 82%, transparent) 12deg,
			color-mix(in srgb, var(--orbit-color) 62%, transparent) 40deg,
			color-mix(in srgb, var(--orbit-color) 42%, transparent) 85deg,
			color-mix(in srgb, var(--orbit-color) 26%, transparent) 140deg,
			color-mix(in srgb, var(--orbit-color) 14%, transparent) 200deg,
			var(--trail-floor) 260deg,
			var(--trail-floor) 355deg,
			color-mix(in srgb, var(--orbit-color) 95%, transparent) 360deg
		);
	}

	.spinner {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
		animation: orbit-rot var(--period) linear infinite;
	}

	/* Zero-sized so its transform-origin is the orbit's centre, letting
	   translateY place the sphere exactly on the arc. */
	.arm {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 0;
		height: 0;
		transform-style: preserve-3d;
		transform: translateY(calc(-1 * var(--orbit-r)));
	}

	/* Counter-rotates the spinner so the sphere keeps its own orientation
	   while travelling. */
	.planet {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;
		transform-style: preserve-3d;
		animation: orbit-rot-counter var(--period) linear infinite;
	}

	.orbit-svelte .spinner,
	.orbit-svelte .planet {
		animation-direction: reverse;
	}

	/*
		Undoing the plane's own tilt here is what keeps the sphere facing the
		viewer — a billboard — so it stays a circle rather than squashing to
		an ellipse as it travels round a steeply tilted orbit.
	*/
	.planet-face {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--planet-size);
		height: var(--planet-size);
		margin-left: calc(var(--planet-size) / -2);
		margin-top: calc(var(--planet-size) / -2);
		display: grid;
		place-items: center;
		border-radius: 50%;
		transform: rotateX(calc(-1 * var(--tx))) rotateZ(calc(-1 * var(--tz)));
	}

	/*
		The mark carries the brand colour and the glow around it is what
		closes into a circle — light thrown off the logo rather than a
		painted ball. Built like a real light source: a luminous core fading
		out through a brand-coloured corona, with no hard fill or rim, which
		is what made the earlier solid version read as a sticker.

		The core is deliberately near-white rather than tinted. It gives the
		mark one constant ground, so the glyph stays crisp whichever theme is
		active and whatever part of the photo happens to be behind it — the
		brand-coloured-mark-on-brand-coloured-glow version was legible over
		the grey backdrop but disappeared against the dark suit.
	*/
	.planet-face {
		background: radial-gradient(
			circle,
			rgba(255, 255, 255, 0.95) 0%,
			rgba(255, 255, 255, 0.86) 21%,
			color-mix(in srgb, var(--orbit-color) 62%, transparent) 43%,
			color-mix(in srgb, var(--orbit-color) 22%, transparent) 60%,
			transparent 76%
		);
		/* Spread beyond the box so the halo keeps reading as emitted light
		   rather than stopping at an invisible boundary. */
		box-shadow: 0 0 12px 2px color-mix(in srgb, var(--orbit-color) 30%, transparent);
	}

	.planet-face svg {
		width: 42%;
		height: 42%;
		/* Fixed brand hexes rather than the theme tokens: the orb brings its
		   own light core, so the mark no longer needs to adapt to the page —
		   and the dark-theme tokens are lightened for dark grounds, which
		   would wash out against that core. */
		fill: var(--mark);
		/*
			Cancels the plane's precession so the glyph stays upright instead
			of slowly cartwheeling. It only needs to live on the mark: being
			innermost, its rotation composes onto the end of the counter chain
			as exactly the inverse — and the orb around it is radially
			symmetric, so the leftover spin there is invisible.
		*/
		animation: precess-counter var(--precess) linear infinite;
	}

	@keyframes precess-counter {
		to {
			transform: rotate(-360deg);
		}
	}

	@keyframes orbit-rot {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes orbit-rot-counter {
		to {
			transform: rotate(-360deg);
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

	/*
		The first solid panel, and the one that closes the hero's window. Its
		ground is on a pseudo-element and masked so it fades in over 140px,
		letting the substrate bleed through the seam instead of meeting the hero
		at a hard line. Masking the box itself would fade the copy with it.
	*/
	.about {
		position: relative;
		padding-block: var(--section-y);
	}

	.about::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--bg-inset);
		pointer-events: none;
		z-index: 0;
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

	.about > .shell {
		position: relative;
		z-index: 1;
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
