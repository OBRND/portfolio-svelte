<script lang="ts">
	import '../../app.css';
	import '$lib/themes';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { reducedMotion } from '$lib/stores/motion';
	import { scramble } from '$lib/actions/scramble';
	import { cursorGlow } from '$lib/actions/cursorGlow';

	let { children } = $props();

	const sections = [
		{ id: 'about', label: 'About' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'services', label: 'Services' },
		{ id: 'projects', label: 'Projects' },
		{ id: 'contact', label: 'Contact' }
	];

	/**
	 * Vertical odometer transition for the header's current-section title: the
	 * outgoing label slides out one way while the incoming one slides in from
	 * the other, with a light defocus riding along so the swap reads as a
	 * single continuous motion rather than two separate ones. `y`'s sign
	 * carries the scroll direction — see the `in:`/`out:` call sites below.
	 */
	function titleSlide(_node: HTMLElement, { y = 18, duration = 520 }: { y?: number; duration?: number }) {
		return {
			duration: $reducedMotion ? 0 : duration,
			easing: quintOut,
			css: (t: number, u: number) => `
				transform: translate3d(0, ${u * y}px, 0);
				opacity: ${t};
				filter: blur(${u * 3}px);
			`
		};
	}

	const socials = [
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

	let scrolled = $state(false);
	let activeSection = $state('about');
	let menuOpen = $state(false);
	let scrollProgress = $state(0);
	let footerEl = $state<HTMLElement | null>(null);
	let footerHeight = $state(320);
	let navbarEl = $state<HTMLElement | null>(null);

	/**
	 * Which `data-divider` (a Section's own "01 Toolkit"-style rule) has most
	 * recently scrolled up to the header, as an index into `dividerTexts` —
	 * -1 means none yet, i.e. still above the first one.
	 */
	let dividerIndex = $state(-1);
	let dividerTexts: string[] = [];
	/** +1 once a later divider becomes active, -1 for an earlier one — the
	    header title rotator reads this to decide which way to slide. */
	let titleDir = $state(1);

	/** The brand identity at rest, then whichever divider has reached the header. */
	const headerTitle = $derived(dividerIndex === -1 ? 'Obsan Diribsa' : (dividerTexts[dividerIndex] ?? 'Obsan Diribsa'));

	onMount(() => {
		/**
		 * Scroll-spy via IntersectionObserver, for the nav links' own active
		 * state (About/Skills/Services/Projects/Contact) — independent of the
		 * header title rotator below, which tracks individual section dividers
		 * rather than these five big regions.
		 */
		const spy = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeSection = entry.target.id;
				}
			},
			{ rootMargin: '-30% 0px -60% 0px', threshold: 0 }
		);

		for (const section of sections) {
			const el = document.getElementById(section.id);
			if (el) spy.observe(el);
		}

		/**
		 * Header title rotator: each Section on the page stamps its own
		 * "01 Toolkit" style rule with `data-divider` (see Section.svelte). On
		 * every scroll frame, the one that has most recently scrolled up to
		 * the header's bottom edge — the divider with the greatest
		 * `top <= headerHeight` — becomes the header's title, so the label
		 * reads as having detached from the page and landed in the header's
		 * slot exactly when it reaches it.
		 *
		 * An IntersectionObserver with a hairline rootMargin can do this too,
		 * and more cheaply, but it turned out to miss crossings under fast or
		 * programmatic scrolling in testing — this re-derives the answer from
		 * real positions on every frame instead, which is a few cheap
		 * getBoundingClientRect() reads and is unconditionally correct.
		 */
		const dividerEls = Array.from(document.querySelectorAll<HTMLElement>('[data-divider]'));
		dividerTexts = dividerEls.map((el) => el.querySelector('.eyebrow')?.textContent?.trim() ?? '');

		function recomputeDivider() {
			const headerHeight = navbarEl?.offsetHeight ?? 64;
			let bestIndex = -1;
			let bestTop = -Infinity;
			dividerEls.forEach((el, i) => {
				if (!dividerTexts[i]) return;
				const top = el.getBoundingClientRect().top;
				if (top <= headerHeight && top > bestTop) {
					bestTop = top;
					bestIndex = i;
				}
			});
			if (bestIndex !== dividerIndex) {
				titleDir = bestIndex > dividerIndex ? 1 : -1;
				dividerIndex = bestIndex;
			}
		}
		recomputeDivider();

		let scrollRaf = 0;
		const onScroll = () => {
			scrolled = window.scrollY > 24;
			const max = document.documentElement.scrollHeight - window.innerHeight;
			scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;

			if (scrollRaf) return;
			scrollRaf = requestAnimationFrame(() => {
				scrollRaf = 0;
				if (dividerEls.length) recomputeDivider();
			});
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		// The footer is fixed behind the page; the content below reserves exactly
		// its height so scrolling to the end reveals it. Measured rather than
		// hard-coded so it stays correct when the footer wraps at any width.
		let resize: ResizeObserver | undefined;
		if (footerEl) {
			resize = new ResizeObserver(([entry]) => {
				footerHeight = entry.contentRect.height;
			});
			resize.observe(footerEl);
		}

		return () => {
			spy.disconnect();
			if (scrollRaf) cancelAnimationFrame(scrollRaf);
			window.removeEventListener('scroll', onScroll);
			resize?.disconnect();
		};
	});

	function closeMenu() {
		menuOpen = false;
	}
</script>

<a class="u-skip-link" href="#about">Skip to content</a>

<div class="app" style="--footer-h: {footerHeight}px">
	<!--
		Sits behind the page and is revealed by the spacer below the content.
		Fixed positioning with a reserved spacer replaces the previous JS transform,
		which was both broken (its computed values were overwritten by later
		reactive statements) and a `position: fixed` containing block that trapped
		every overlay inside it.
	-->
	<footer class="site-footer" bind:this={footerEl} use:cursorGlow>
		<div class="footer-inner">
			<div class="footer-top">
				<div class="footer-brand">
					<p class="footer-name">Obsan Diribsa</p>
				</div>

				<div class="footer-cols">
					<div class="footer-col">
						<h2>Navigate</h2>
						<ul>
							{#each sections as section}
								<li><a href="#{section.id}">{section.label}</a></li>
							{/each}
						</ul>
					</div>

					<div class="footer-col">
						<h2>Contact</h2>
						<ul>
							<li><a href="mailto:obsannew@gmail.com">obsannew@gmail.com</a></li>
							<li><a href="tel:+251940844097">+251 940 844 097</a></li>
							<li><span>Addis Ababa, Ethiopia</span></li>
						</ul>
					</div>

					<div class="footer-col">
						<h2>Elsewhere</h2>
						<ul class="footer-socials">
							{#each socials as social}
								<li>
									<a
										href={social.href}
										target={social.href.startsWith('mailto:') ? null : '_blank'}
										rel="noopener noreferrer"
										aria-label={social.label}
									>
										<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
											<path d={social.path} />
										</svg>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>

			<div class="footer-bottom">
				<p>© {new Date().getFullYear()} Obsan Diribsa</p>
				<p>Built with <span class="hl-svelte">SvelteKit</span></p>
			</div>
		</div>
	</footer>

	<div class="page">
		<!--
			The ground the whole page is laid over. Sections with `tone="window"`
			leave their own ground unpainted and reveal this instead — the same
			move the footer above already makes, turned inward.
		-->
		<div class="substrate-track" aria-hidden="true">
			<div class="page-substrate">
				<div class="substrate-bloom"></div>
			</div>
		</div>

		<header class="navbar" class:scrolled bind:this={navbarEl}>
			<div class="nav-inner">
				<div class="brand">
					<a class="mark" href="#about" onclick={closeMenu}>
						OB
						<span class="u-sr-only">Obsan Diribsa — back to top</span>
					</a>

					<!--
						The header's "rotatable" title: the brand name at rest, then
						whichever section is currently in view, one label swapped for the
						next as a vertical odometer. Purely a visual affordance — the
						section links below (and the mobile nav) already carry the
						accessible `aria-current`, so this stays out of the a11y tree
						rather than announcing every scroll-driven change.
					-->
					<div class="title-rotator" aria-hidden="true">
						{#key headerTitle}
							<span
								class="title-slide"
								in:titleSlide={{ y: titleDir * 18 }}
								out:titleSlide={{ y: titleDir * -18 }}
								use:scramble={headerTitle}
							></span>
						{/key}
					</div>
				</div>

				<nav class="nav-links" aria-label="Sections">
					<ul>
						{#each sections as section}
							<li>
								<a
									href="#{section.id}"
									class:active={activeSection === section.id}
									aria-current={activeSection === section.id ? 'true' : undefined}
								>
									{section.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>

				<div class="nav-actions">
					<ThemeToggle />
					<button
						class="menu-toggle"
						onclick={() => (menuOpen = !menuOpen)}
						aria-expanded={menuOpen}
						aria-controls="mobile-nav"
						aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					>
						<span class="bar" class:open={menuOpen}></span>
						<span class="bar" class:open={menuOpen}></span>
					</button>
				</div>
			</div>

			<!-- Scroll position, doubling as the navbar's bottom edge. -->
			<div class="progress" aria-hidden="true">
				<span style="transform: scaleX({scrollProgress})"></span>
			</div>
		</header>

		<nav class="mobile-nav" id="mobile-nav" class:open={menuOpen} aria-label="Sections">
			<ul>
				{#each sections as section}
					<li>
						<a
							href="#{section.id}"
							class:active={activeSection === section.id}
							onclick={closeMenu}
							tabindex={menuOpen ? 0 : -1}
						>
							{section.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<main class="main-content">
			{@render children?.()}
		</main>
	</div>

	<!-- Reserves the footer's height so the page can scroll past it. -->
	<div class="footer-spacer" aria-hidden="true"></div>
</div>

<style>
	.app {
		position: relative;
		min-height: 100vh;
	}

	/* ---- Navbar ---------------------------------------------------------- */

	.navbar {
		position: sticky;
		top: 0;
		z-index: var(--z-nav);
		background: color-mix(in srgb, var(--bg) 72%, transparent);
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
		border-bottom: 1px solid transparent;
		transition:
			background-color var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out);
	}

	.navbar.scrolled {
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		border-bottom-color: var(--line);
	}

	.nav-inner {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		width: 100%;
		max-width: var(--maxw);
		margin-inline: auto;
		padding: 0.75rem var(--gutter);
		transition: padding var(--dur-base) var(--ease-out);
	}

	.navbar.scrolled .nav-inner {
		padding-block: 0.5rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		/* flex-grow rather than margin-right:auto — the old shrink-to-fit box
		   gave .title-rotator's own flex:1 nothing real to grow into, so the
		   longest divider labels stayed clipped to its min-width regardless
		   of its max-width. A grown .brand has an actual computed width for
		   the rotator to fill up to that max-width. */
		flex: 1;
		min-width: 0;
	}

	.mark {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: var(--r-sm);
		background: var(--text);
		color: var(--bg);
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		flex-shrink: 0;
		text-decoration: none;
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.mark:hover {
		transform: translateY(-1px);
	}

	/* ---- Header title rotator ---------------------------------------------
	   The brand name at rest, swapped for whichever section is in view as the
	   page scrolls — one label sliding out while the next slides in, like an
	   odometer reel. Fixed to one line's height with `overflow: hidden` so the
	   in-flight pair (outgoing + incoming) stack on top of each other instead
	   of shoving the header's own height around mid-transition. */
	.title-rotator {
		position: relative;
		flex: 1;
		/* Every child is `position: absolute`, so the rotator has no in-flow
		   content to size itself around — without an explicit floor here it
		   collapses toward zero width and clips whatever it's showing. Upper
		   bound wide enough for the longest divider label ("04 Selected work:
		   mobile") without ellipsis-truncating it. */
		min-width: 9rem;
		max-width: 18rem;
		height: 1.4em;
	}

	.title-slide {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		font-weight: 600;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--text);
		will-change: transform, opacity, filter;
	}

	.nav-links {
		display: none;
	}

	.nav-links ul {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		list-style: none;
	}

	.nav-links a {
		position: relative;
		display: block;
		padding: 0.45rem 0.8rem;
		border-radius: var(--r-pill);
		color: var(--text-muted);
		font-size: var(--fs-sm);
		font-weight: 500;
		text-decoration: none;
		transition:
			color var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}

	.nav-links a:hover {
		color: var(--text);
		background: var(--bg-inset);
	}

	.nav-links a.active {
		color: var(--text);
		background: var(--bg-inset);
	}

	.nav-links a.active::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0.1rem;
		width: 14px;
		height: 2px;
		border-radius: 2px;
		background: var(--accent);
		transform: translateX(-50%);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.menu-toggle {
		display: grid;
		place-content: center;
		gap: 5px;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: var(--bg-elev-1);
		cursor: pointer;
	}

	.bar {
		display: block;
		width: 16px;
		height: 1.5px;
		border-radius: 2px;
		background: var(--text);
		transition: transform var(--dur-base) var(--ease-out);
	}

	.bar.open:first-child {
		transform: translateY(3.25px) rotate(45deg);
	}

	.bar.open:last-child {
		transform: translateY(-3.25px) rotate(-45deg);
	}

	.progress {
		height: 2px;
		background: transparent;
		overflow: hidden;
	}

	.progress span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--flutter), var(--svelte));
		transform-origin: 0 50%;
		transition: transform 120ms linear;
	}

	/* ---- Mobile menu ------------------------------------------------------ */

	.mobile-nav {
		position: sticky;
		top: 0;
		z-index: calc(var(--z-nav) - 1);
		overflow: hidden;
		max-height: 0;
		background: var(--bg-elev-1);
		border-bottom: 1px solid transparent;
		transition:
			max-height var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out);
	}

	.mobile-nav.open {
		max-height: 24rem;
		border-bottom-color: var(--line);
	}

	.mobile-nav ul {
		list-style: none;
		padding: var(--sp-3) var(--gutter) var(--sp-4);
	}

	.mobile-nav a {
		display: block;
		padding: 0.75rem 0.5rem;
		border-bottom: 1px solid var(--line);
		color: var(--text-muted);
		font-size: var(--fs-lead);
		font-weight: 500;
		text-decoration: none;
	}

	.mobile-nav a.active {
		color: var(--text);
	}

	/* ---- Page & footer reveal --------------------------------------------- */

	/*
		No ground of its own any more — `.page-substrate` below is what makes the
		page opaque over the fixed footer. Painting it here as well would put an
		unbroken sheet behind every section and there would be nothing for a
		window section to reveal.
	*/
	.page {
		position: relative;
		z-index: var(--z-content);
	}

	/*
		Sticky rather than fixed, which matters: a fixed layer would have to sit
		above --z-footer to show through a window, and being opaque it would then
		cover the footer and kill the reveal below. Sticky scopes it to `.page`,
		so it unpins exactly where `.page` ends — which is where the footer
		reveal already begins. The two compose instead of fighting.

		One viewport tall, then pulled back out of flow, so the browser paints a
		single screen of gradients once instead of a canvas the height of the
		whole document. It holds still while the content scrolls over it, which
		is where the parallax comes from — no scroll listener involved.
	*/
	/*
		The track spans `.page` and takes the layer out of flow, so it adds no
		page height. It also supplies the sticky child's constraint rectangle,
		which is the part that matters: pulling the layer out of flow with a
		`margin-bottom: -100dvh` instead lets its *border* box overhang the
		containing block by a full viewport, and it ends up painted over the
		footer — swallowing the reveal at the bottom of the page.
	*/
	/*
		Deliberately no `overflow` here. An ancestor with a non-visible overflow
		becomes the sticky child's scroll container, and since this track never
		scrolls, the layer would silently stop sticking and sit at the top of
		the page instead — leaving every window section showing the fixed footer
		behind it. Clipping happens on `.page-substrate` itself, which is safe.
	*/
	.substrate-track {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.page-substrate {
		position: sticky;
		top: 0;
		height: 100dvh;
		background: var(--bg);
		overflow: hidden;
	}

	/* The blueprint itself. Masked to fall away toward the edges so it reads as
	   texture under the content rather than as graph paper. */
	.page-substrate::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			repeating-linear-gradient(
				to right,
				var(--grid-major) 0 1px,
				transparent 1px calc(var(--grid-pitch) * 5)
			),
			repeating-linear-gradient(
				to bottom,
				var(--grid-major) 0 1px,
				transparent 1px calc(var(--grid-pitch) * 5)
			),
			repeating-linear-gradient(
				to right,
				var(--grid-line) 0 1px,
				transparent 1px var(--grid-pitch)
			),
			repeating-linear-gradient(
				to bottom,
				var(--grid-line) 0 1px,
				transparent 1px var(--grid-pitch)
			);
		-webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 35%, transparent 92%);
		mask-image: radial-gradient(120% 100% at 50% 0%, #000 35%, transparent 92%);
	}

	/*
		The two brand blooms, on their own element so a transform can move them.
		Oversized and offset upward so the drift below never exposes an edge.
	*/
	.substrate-bloom {
		position: absolute;
		inset: -20% 0 -20%;
		background: var(--ambient);
	}

	/*
		Scroll-driven animations run entirely off the compositor — no main-thread
		work per frame, nothing to throttle. Browsers without support simply keep
		the static layer, which already parallaxes on its own.
	*/
	@supports (animation-timeline: scroll()) {
		@media (prefers-reduced-motion: no-preference) {
			.substrate-bloom {
				animation: bloom-drift linear both;
				animation-timeline: scroll(root block);
			}
		}
	}

	@keyframes bloom-drift {
		to {
			transform: translate3d(0, -12%, 0);
		}
	}

	@media (max-width: 768px) {
		/* Widened so the 1px lines do not turn into moiré on a dense phone
		   display, where the grid is also proportionally much busier. */
		.substrate-track {
			--grid-pitch: 88px;
		}
	}

	.main-content {
		width: 100%;
	}

	.footer-spacer {
		height: var(--footer-h);
	}

	/*
		Fixed dark regardless of site theme, rather than the previous
		--bg-sunken (a shade barely off the page background in either theme,
		so the footer never read as a separate zone). Redeclaring the same
		token names the rules below already use — --text, --line, etc. — lets
		every one of them render correctly here without being rewritten
		individually.
	*/
	.site-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: var(--z-footer);
		--bg: #0b0e16;
		--text: #f4f5f7;
		--text-muted: #aab0c0;
		--text-subtle: #7d8496;
		--line: rgba(255, 255, 255, 0.1);
		background:
			radial-gradient(1100px 420px at 12% -20%, rgba(84, 169, 255, 0.16), transparent 60%),
			radial-gradient(900px 420px at 88% 120%, rgba(255, 107, 61, 0.14), transparent 60%),
			var(--bg);
		border-top: 1px solid var(--line);
		color: var(--text-muted);
		overflow: hidden;
	}

	/* Echoes the nav's scroll-progress bar at the opposite end of the page. */
	.site-footer::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 2px;
		background: linear-gradient(90deg, var(--flutter), var(--svelte));
		opacity: 0.7;
	}

	/* Soft glow trailing the cursor over the footer, driven by
	   src/lib/actions/cursorGlow.ts. Plain white rather than a theme token —
	   the footer is a fixed dark ground regardless of site theme (see above),
	   so a low-opacity white reads correctly no matter what theme is active. */
	.site-footer::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			420px circle at var(--glow-x, 50%) var(--glow-y, 50%),
			rgba(255, 255, 255, 0.07),
			transparent 70%
		);
		opacity: var(--glow-opacity, 0);
		transition: opacity 500ms var(--ease-out);
		pointer-events: none;
	}

	.footer-inner {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: var(--maxw);
		margin-inline: auto;
		padding: clamp(2rem, 5vw, 3rem) var(--gutter) clamp(1.25rem, 3vw, 1.75rem);
	}

	.footer-top {
		display: grid;
		gap: var(--sp-6);
		padding-bottom: var(--sp-6);
	}

	.footer-name {
		font-family: var(--font-display);
		font-size: var(--fs-h3);
		font-weight: 700;
		letter-spacing: var(--tracking-head);
		color: var(--text);
	}

	/* A fixed value rather than the theme-flipping --svelte token: the footer
	   itself is a fixed dark regardless of site theme (see .site-footer
	   above), and --svelte-ink in particular is tuned for a light ground, so
	   it would fail contrast here in light mode. */
	.hl-svelte {
		color: #ff6b3d;
		font-weight: 600;
	}

	.footer-cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--sp-5);
	}

	.footer-col h2 {
		font-family: var(--font-body);
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: var(--sp-3);
	}

	.footer-col ul {
		list-style: none;
		display: grid;
		gap: 0.4rem;
	}

	.footer-col a,
	.footer-col span {
		font-size: var(--fs-sm);
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.footer-col a:hover {
		color: var(--text);
	}

	.footer-socials {
		display: flex !important;
		gap: 0.4rem;
	}

	.footer-socials a {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 1px solid var(--line);
		color: var(--text-muted);
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.footer-socials a:hover {
		background: var(--text);
		color: var(--bg);
	}

	.footer-bottom {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--sp-3);
		padding-top: var(--sp-5);
		border-top: 1px solid var(--line);
		font-size: var(--fs-xs);
		color: var(--text-subtle);
	}

	/* ---- Layout ----------------------------------------------------------- */

	@media (min-width: 820px) {
		.nav-links {
			display: block;
		}

		.menu-toggle,
		.mobile-nav {
			display: none;
		}

		.footer-top {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
			align-items: start;
		}
	}

	@media (max-width: 400px) {
		/* The static name was dropped here for space; the rotator earns its
		   keep even this narrow since it's the one place a scrolled-down
		   visitor can see what section they're in, so it shrinks instead. */
		.title-slide {
			font-size: var(--fs-xs);
		}
	}
</style>
