<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque/standard.css';
	import '@fontsource/instrument-serif/latin-400.css';
	import '@fontsource/instrument-serif/latin-400-italic.css';
	import '@fontsource-variable/jetbrains-mono/index.css';
	import '../../app.css';
	import '$lib/themes';

	import { onMount } from 'svelte';
	import Atmosphere from '$lib/components/Atmosphere.svelte';
	import Preloader from '$lib/components/Preloader.svelte';
	import Cursor from '$lib/components/Cursor.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import Mark from '$lib/components/Mark.svelte';
	import { theme, toggleTheme } from '$lib/stores/theme';
	import { mood, MOODS, type MoodName } from '$lib/stores/stage';
	import { startScroll, scrollTo, lockScroll } from '$lib/motion/scroll';
	import { magnetic } from '$lib/actions/magnetic';
	import { fit } from '$lib/actions/fit';
	import { person, sections, socials } from '$lib/data/site';

	let { children } = $props();

	let menuOpen = $state(false);
	let activeSection = $state('top');
	let root = $state<HTMLElement | null>(null);

	const rail = [{ id: 'top', label: 'Intro' }, ...sections];
	const activeIndex = $derived(Math.max(0, rail.findIndex((item) => item.id === activeSection)));

	function setMenu(open: boolean) {
		if (menuOpen === open) return;
		menuOpen = open;
		lockScroll(open);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && menuOpen) setMenu(false);
	}

	onMount(() => {
		const stopScroll = startScroll();

		/**
		 * In-page links go through the scroll engine instead of jumping. This is
		 * a capture listener on the root on purpose: it has to run before
		 * SvelteKit's own router sees the click, which would otherwise perform
		 * the native jump first and leave the eased scroll nothing to travel.
		 */
		const onClick = (event: MouseEvent) => {
			if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
			const hash = link?.getAttribute('href');
			if (!hash || hash.length < 2) return;
			const target = document.querySelector<HTMLElement>(hash);
			if (!target) return;

			event.preventDefault();
			const wasOpen = menuOpen;
			setMenu(false);
			history.replaceState(history.state, '', hash);
			// Give the menu a beat to start closing so the page is not seen
			// racing away underneath a panel that is still fully open.
			setTimeout(() => scrollTo(target, { duration: wasOpen ? 1.7 : 1.5 }), wasOpen ? 220 : 0);
		};
		root?.addEventListener('click', onClick, true);

		/**
		 * Which section owns the middle of the viewport. One hairline band
		 * across the centre, so exactly one section is ever "current" — it
		 * drives both the rail and the atmosphere's lighting.
		 */
		const spy = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const el = entry.target as HTMLElement;
					if (el.dataset.section) activeSection = el.dataset.section;
					const next = el.dataset.mood as MoodName | undefined;
					if (next && next in MOODS) mood.set(next);
				}
			},
			{ rootMargin: '-50% 0px -50% 0px', threshold: 0 }
		);
		document.querySelectorAll<HTMLElement>('[data-section], [data-mood]').forEach((el) => spy.observe(el));

		return () => {
			root?.removeEventListener('click', onClick, true);
			spy.disconnect();
			stopScroll();
		};
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div class="site" bind:this={root}>
	<a class="u-skip-link" href="#about">Skip to content</a>

	<Preloader />
	<Atmosphere />
	<Cursor />

	<!--
		`mix-blend-mode: difference` rather than a background of its own: the
		header crosses an ink sky, bone paper and four flat poster colours on the
		way down, and inverting whatever is behind it is the one treatment that
		stays legible over all of them without a bar cutting across the type.
	-->
	<header class="bar" class:menu-open={menuOpen}>
		<a class="brand" href="#top" aria-label="{person.name} — back to top">
			<Mark size={26} />
			<span class="brand-name">{person.name}</span>
		</a>

		<div class="bar-actions">
			<button
				type="button"
				class="theme"
				onclick={toggleTheme}
				aria-label={$theme === 'dark' ? 'Switch to day' : 'Switch to night'}
			>
				<span class="theme-dot" class:day={$theme !== 'dark'} aria-hidden="true"></span>
				<span class="theme-text">{$theme === 'dark' ? 'Night' : 'Day'}</span>
			</button>

			<button
				type="button"
				class="menu-toggle"
				onclick={() => setMenu(!menuOpen)}
				aria-expanded={menuOpen}
				aria-controls="site-menu"
			>
				<span class="menu-word" aria-hidden="true">
					<span>Menu</span>
					<span>Close</span>
				</span>
				<span class="u-sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
				<span class="burger" aria-hidden="true"><i></i><i></i></span>
			</button>
		</div>
	</header>

	<!-- Where you are on the page, down the right edge. -->
	<nav class="rail" aria-label="Sections">
		<span class="rail-count" aria-hidden="true">
			{String(activeIndex).padStart(2, '0')}<i>/</i>{String(rail.length - 1).padStart(2, '0')}
		</span>
		<ul>
			{#each rail as item}
				<li>
					<a
						href="#{item.id}"
						class:active={activeSection === item.id}
						aria-current={activeSection === item.id ? 'true' : undefined}
					>
						<span class="rail-label">{item.label}</span>
						<span class="rail-tick" aria-hidden="true"></span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<nav class="menu" id="site-menu" class:open={menuOpen} aria-label="Main" inert={!menuOpen}>
		<div class="menu-inner" data-lenis-prevent>
			<ul class="menu-links">
				{#each sections as section, i}
					<li style="--i: {i}">
						<a href="#{section.id}" class:active={activeSection === section.id}>
							<span class="menu-index">{String(i + 1).padStart(2, '0')}</span>
							<span class="menu-label"><span>{section.label}</span></span>
						</a>
					</li>
				{/each}
			</ul>

			<div class="menu-side">
				<div class="menu-block" style="--i: 2">
					<span class="menu-cap">Say hi</span>
					<a class="menu-mail" href="mailto:{person.email}">{person.email}</a>
				</div>

				<div class="menu-block" style="--i: 3">
					<span class="menu-cap">Elsewhere</span>
					<ul class="menu-socials">
						{#each socials.filter((s) => s.label !== 'Email') as social}
							<li><a href={social.href} target="_blank" rel="noopener noreferrer">{social.label} ↗</a></li>
						{/each}
						<li><a href={person.cv} download>Download CV ↓</a></li>
					</ul>
				</div>

				<div class="menu-block" style="--i: 4">
					<span class="menu-cap">{person.city}, {person.country}</span>
					<span class="menu-time"><Clock /></span>
				</div>
			</div>
		</div>
	</nav>

	<main id="top">
		{@render children?.()}
	</main>

	<footer class="footer" data-section="contact" data-mood="ember">
		<div class="footer-inner">
			<div class="footer-top">
				<p class="footer-line">
					Backend, mobile and web,<br />
					<span class="u-serif">built as one</span> system.
				</p>

				<ul class="footer-links">
					{#each sections as section}
						<li><a href="#{section.id}">{section.label}</a></li>
					{/each}
				</ul>

				<ul class="footer-links">
					{#each socials as social}
						<li>
							<a
								href={social.href}
								target={social.href.startsWith('mailto:') ? null : '_blank'}
								rel="noopener noreferrer"
							>
								{social.label}
							</a>
						</li>
					{/each}
				</ul>

				<a class="to-top" href="#top" use:magnetic aria-label="Back to top">
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M12 19V5M5 12l7-7 7 7" />
					</svg>
				</a>
			</div>

			<p class="wordmark" aria-hidden="true"><span use:fit>{person.name}</span></p>

			<div class="footer-bottom u-label">
				<span>© {new Date().getFullYear()} {person.name}</span>
				<span>Built with SvelteKit</span>
			</div>
		</div>
	</footer>
</div>

<style>
	.site {
		position: relative;
		min-height: 100vh;
	}

	main {
		position: relative;
		z-index: var(--z-content);
	}

	/* ---- Header ----------------------------------------------------------- */

	.bar {
		position: fixed;
		inset: 0 0 auto;
		z-index: calc(var(--z-menu) + 1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-4);
		height: var(--header-h);
		padding-inline: var(--gutter);
		color: #fff;
		mix-blend-mode: difference;
		pointer-events: none;
	}

	/* A blended bar makes the browser composite everything under it into a
	   separate surface on every scroll frame, which phones pay for dearly. On
	   a small screen nothing of the opposite colour passes under the header
	   anyway, so it is set in the page's own ink there. */
	@media (max-width: 820px), (pointer: coarse) {
		.bar {
			mix-blend-mode: normal;
			color: var(--text);
		}
	}

	.bar > :global(*) {
		pointer-events: auto;
	}

	/* The menu panel is one flat colour, so it needs ink, not an inversion. */
	.bar.menu-open {
		mix-blend-mode: normal;
		color: #07080c;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		text-decoration: none;
		color: inherit;
	}

	.brand-name {
		font-size: var(--fs-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.bar-actions {
		display: flex;
		align-items: center;
		gap: clamp(1rem, 2.4vw, 2rem);
	}

	.theme,
	.menu-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 44px;
		color: inherit;
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		font-weight: 500;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
	}

	/* A moon that fills out into a sun. */
	.theme-dot {
		position: relative;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid currentColor;
		overflow: hidden;
	}

	.theme-dot::after {
		content: '';
		position: absolute;
		inset: 0;
		background: currentColor;
		transform: translateX(-55%);
		transition: transform var(--dur-slow) var(--ease-out);
	}

	.theme-dot.day::after {
		transform: translateX(0);
	}

	.theme-text {
		display: none;
	}

	/* Two words stacked in a one-line window; opening the menu rolls the
	   window from one to the other. */
	.menu-word {
		display: grid;
		height: 1.2em;
		line-height: 1.2;
		overflow: hidden;
		text-align: right;
	}

	.menu-word span {
		display: block;
		transition: transform var(--dur-slow) var(--ease-in-out);
	}

	.menu-open .menu-word span {
		transform: translateY(-100%);
	}

	.burger {
		display: grid;
		gap: 6px;
		width: 26px;
	}

	.burger i {
		display: block;
		height: 1.5px;
		background: currentColor;
		transition: transform var(--dur-slow) var(--ease-in-out);
	}

	.menu-open .burger i:first-child {
		transform: translateY(3.75px) rotate(45deg);
	}

	.menu-open .burger i:last-child {
		transform: translateY(-3.75px) rotate(-45deg);
	}

	/* ---- Section rail ----------------------------------------------------- */

	.rail {
		position: fixed;
		right: var(--gutter);
		top: 50%;
		z-index: var(--z-nav);
		display: none;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.9rem;
		transform: translateY(-50%);
		color: #fff;
		mix-blend-mode: difference;
	}

	.rail-count {
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		letter-spacing: 0.1em;
		font-variant-numeric: tabular-nums;
	}

	.rail-count i {
		font-style: normal;
		opacity: 0.5;
		margin-inline: 0.25em;
	}

	.rail ul {
		list-style: none;
		display: grid;
		justify-items: end;
	}

	.rail a {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.6rem;
		padding-block: 0.34rem;
		color: inherit;
		text-decoration: none;
	}

	.rail-tick {
		width: 14px;
		height: 1px;
		background: currentColor;
		opacity: 0.45;
		transform-origin: 100% 50%;
		transition:
			transform var(--dur-slow) var(--ease-out),
			opacity var(--dur-base) ease;
	}

	.rail-label {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		opacity: 0;
		transform: translateX(6px);
		transition:
			opacity var(--dur-base) ease,
			transform var(--dur-slow) var(--ease-out);
	}

	/* Labels only on hover or focus: shown permanently, the current one sat
	   on top of whatever the page had in the right margin. The count above
	   and the longer tick already say where you are. */
	.rail a:hover .rail-label,
	.rail a:focus-visible .rail-label {
		opacity: 1;
		transform: none;
	}

	.rail a:hover .rail-tick,
	.rail a.active .rail-tick {
		opacity: 1;
		transform: scaleX(2.2);
	}

	/* ---- Menu overlay ----------------------------------------------------- */

	.menu {
		position: fixed;
		inset: 0;
		z-index: var(--z-menu);
		background: var(--poster-ember);
		color: #07080c;
		clip-path: inset(0 0 100% 0);
		visibility: hidden;
		transition:
			clip-path 900ms var(--ease-in-out),
			visibility 0s linear 900ms;
	}

	.menu.open {
		clip-path: inset(0 0 0 0);
		visibility: visible;
		transition:
			clip-path 900ms var(--ease-in-out),
			visibility 0s;
	}

	.menu-inner {
		display: grid;
		align-content: space-between;
		gap: var(--sp-7);
		height: 100%;
		padding: calc(var(--header-h) + 1.5rem) var(--gutter) clamp(1.5rem, 4vw, 3rem);
		overflow-y: auto;
	}

	.menu-links {
		list-style: none;
	}

	.menu-links a {
		display: flex;
		align-items: baseline;
		gap: clamp(0.75rem, 2vw, 2rem);
		padding-block: 0.05em;
		color: inherit;
		text-decoration: none;
	}

	.menu-index {
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		letter-spacing: 0.1em;
		opacity: 0.6;
		min-width: 1.8em;
	}

	.menu-label {
		display: block;
		overflow: hidden;
		padding-block: 0.06em 0.1em;
		font-family: var(--font-display);
		font-size: clamp(3.2rem, 11.5vh, 8.5rem);
		font-weight: 300;
		font-stretch: 82%;
		line-height: 0.92;
		letter-spacing: var(--tracking-display);
	}

	.menu-label span {
		display: inline-block;
		transform: translate3d(0, 110%, 0);
		transition:
			transform 900ms var(--ease-out),
			font-weight 500ms var(--ease-out),
			letter-spacing 500ms var(--ease-out);
	}

	.menu.open .menu-label span {
		transform: none;
		transition-delay: calc(260ms + var(--i) * 70ms), 0ms, 0ms;
	}

	/* The variable font does the hover: the word puts on weight. */
	.menu-links a:hover .menu-label span,
	.menu-links a:focus-visible .menu-label span {
		font-weight: 600;
		letter-spacing: -0.035em;
	}

	.menu-links a.active .menu-label span {
		font-family: var(--font-serif);
		font-style: italic;
		font-stretch: 100%;
		letter-spacing: -0.03em;
	}

	.menu-side {
		display: grid;
		gap: var(--sp-5);
	}

	.menu-block {
		display: grid;
		gap: 0.35rem;
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity 600ms ease,
			transform 800ms var(--ease-out);
	}

	.menu.open .menu-block {
		opacity: 1;
		transform: none;
		transition-delay: calc(420ms + var(--i) * 70ms);
	}

	.menu-cap {
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		opacity: 0.62;
	}

	.menu-mail,
	.menu-time {
		font-size: clamp(1.15rem, 2vw, 1.6rem);
		letter-spacing: -0.02em;
		color: inherit;
		text-decoration: none;
	}

	.menu-socials {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.4rem;
	}

	.menu-socials a {
		font-size: var(--fs-body);
		color: inherit;
		text-decoration: none;
	}

	.menu-mail,
	.menu-socials a {
		background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
		transition: background-size var(--dur-slow) var(--ease-out);
	}

	.menu-mail:hover,
	.menu-socials a:hover {
		background-size: 100% 1px;
	}

	.menu :global(:focus-visible) {
		outline-color: #07080c;
	}

	/* ---- Footer ----------------------------------------------------------- */

	/* Its own ground, a shade under the page's, so the sky stops here and the
	   footer reads as the floor the page stands on rather than more of it.
	   Nothing in it moves with the scroll: it is the last thing on the page,
	   usually shorter than the screen, so a scrubbed entrance never finished
	   and left its top edge cut off. */
	.footer {
		position: relative;
		z-index: var(--z-content);
		border-top: 1px solid var(--line-strong);
		background:
			radial-gradient(60% 90% at 100% 100%, color-mix(in srgb, var(--ember) 16%, transparent), transparent 70%),
			radial-gradient(50% 80% at 0% 100%, color-mix(in srgb, var(--azure) 10%, transparent), transparent 70%),
			var(--bg-sunken);
	}

	.footer-inner {
		display: grid;
		gap: clamp(2rem, 6vw, 5rem);
		padding: clamp(2.5rem, 7vw, 6rem) var(--gutter) clamp(1.25rem, 2.5vw, 2rem);
	}

	.footer-top {
		display: grid;
		gap: var(--sp-6);
		align-items: start;
	}

	.footer-line {
		font-family: var(--font-display);
		font-size: var(--fs-h3);
		font-weight: 400;
		line-height: 1.12;
		letter-spacing: var(--tracking-head);
	}

	.footer-links {
		list-style: none;
		display: grid;
		gap: 0.3rem;
	}

	.footer-links a {
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--dur-fast) ease;
	}

	.footer-links a:hover {
		color: var(--text);
	}

	.to-top {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: 1px solid var(--line-strong);
		color: var(--text);
		transition:
			background-color var(--dur-base) var(--ease-out),
			color var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out);
	}

	.to-top:hover {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg);
	}

	/* Set to the full width of the page: the name as the last thing you see.
	   The size here is only the starting point — `use:fit` measures the line
	   and sets it to span the footer exactly. */
	.wordmark {
		overflow: hidden;
		color: var(--text);
		user-select: none;
	}

	.wordmark span {
		display: block;
		width: max-content;
		font-family: var(--font-display);
		font-size: 17vw;
		font-weight: 300;
		font-stretch: 100%;
		line-height: 0.8;
		letter-spacing: -0.045em;
		white-space: nowrap;
		padding-bottom: 0.04em;
	}

	.footer-bottom {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem var(--sp-5);
		padding-top: var(--sp-4);
		border-top: 1px solid var(--line);
	}

	/* ---- Layout ----------------------------------------------------------- */

	@media (max-width: 520px) {
		.brand-name {
			display: none;
		}
	}

	@media (min-width: 720px) {
		.theme-text {
			display: inline;
		}

		.menu-inner {
			grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
			align-content: end;
			align-items: end;
		}

		.footer-top {
			grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto;
		}
	}

	/* The rail needs a margin to live in; below this it would sit on the type. */
	@media (min-width: 1100px) and (min-height: 620px) {
		.rail {
			display: flex;
		}
	}

</style>
