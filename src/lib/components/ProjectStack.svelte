<script lang="ts">
	import { onDestroy } from 'svelte';
	import { reducedMotion } from '$lib/stores/motion';
	import DeviceFrame from '$lib/components/ui/DeviceFrame.svelte';

	export interface StackProject {
		id: number | string;
		name: string;
		subtitle: string;
		description: string;
		screenshot: string;
		/** Unsigned public Storage URL, retried when `screenshot` fails. */
		screenshotFallback?: string;
		tags: string[];
		technologies: string[];
		year: string;
		detailsLink: string;
	}

	interface Props {
		projects: StackProject[];
		/** Picks the device canvas the screenshot is dropped into. */
		device?: 'phone' | 'browser';
		/** Halts autoplay from the outside — used while the details modal is open. */
		paused?: boolean;
		/** Autoplay dwell in ms. Set to 0 to disable autoplay entirely. */
		interval?: number;
		onselect?: (project: StackProject) => void;
		/** Accessible name for the stack region. */
		label?: string;
	}

	let {
		projects,
		device = 'phone',
		paused = false,
		interval = 7000,
		onselect,
		label = 'Project stack'
	}: Props = $props();

	const EXIT_MS = 620;
	const DRAG_COMMIT_PX = 96;
	const DRAG_COMMIT_VELOCITY = 0.42;

	let activeIndex = $state(0);
	let hovered = $state(false);
	let focusWithin = $state(false);
	let stackEl = $state<HTMLElement | null>(null);
	/**
	 * Whether the deck is at least partly on screen. Advancing the deck swaps
	 * in a card whose screenshot can be a different natural aspect ratio
	 * (DeviceFrame fits its frame to each image), which changes the deck's
	 * own height since the top card is the only one in flow — harmless while
	 * the visitor is looking at it, but a distracting page-height jump if
	 * autoplay keeps doing it while they've scrolled on, e.g. down at the
	 * footer. Gating autoplay on visibility stops it from firing at all once
	 * the deck is off screen.
	 */
	let isVisible = $state(true);

	/** The card mid-flight off the top of the stack, if any. */
	let leaving = $state<{ project: StackProject; dir: 1 | -1; dx: number; dy: number; dr: number } | null>(
		null
	);
	/** Direction a freshly-promoted top card should animate in from. */
	let entering = $state<1 | -1 | 0>(0);

	// Live drag state. Not `$state` for dx/dy — they update on every pointermove
	// and are written straight to the element's style to avoid re-rendering the
	// whole stack at pointer frequency.
	let dragging = $state(false);
	let topCardEl = $state<HTMLElement | null>(null);
	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let startTime = 0;
	let dx = 0;
	let dy = 0;
	let axisLocked: 'none' | 'x' | 'y' = 'none';

	let exitTimer: ReturnType<typeof setTimeout> | null = null;
	let enterTimer: ReturnType<typeof setTimeout> | null = null;
	let autoTimer: ReturnType<typeof setInterval> | null = null;

	const count = $derived(projects.length);
	const visibleCount = $derived(Math.min(3, count));

	/** The cards actually mounted: the top card plus two peeking behind it. */
	const visible = $derived(
		Array.from({ length: visibleCount }, (_, depth) => ({
			project: projects[(activeIndex + depth) % count],
			depth
		}))
	);

	const canCycle = $derived(count > 1);
	const autoplayActive = $derived(
		canCycle &&
			!paused &&
			!hovered &&
			!focusWithin &&
			!dragging &&
			!$reducedMotion &&
			interval > 0 &&
			isVisible
	);

	$effect(() => {
		if (autoTimer) {
			clearInterval(autoTimer);
			autoTimer = null;
		}
		if (!autoplayActive) return;
		autoTimer = setInterval(() => advance(1), interval);
		return () => {
			if (autoTimer) clearInterval(autoTimer);
			autoTimer = null;
		};
	});

	// Guard against the index dangling past the end when the list changes.
	$effect(() => {
		if (count > 0 && activeIndex >= count) activeIndex = 0;
	});

	function clearTimers() {
		if (exitTimer) clearTimeout(exitTimer);
		if (enterTimer) clearTimeout(enterTimer);
		exitTimer = null;
		enterTimer = null;
	}

	/**
	 * Advance the stack. `dir` 1 lifts the top card off to the right and reveals
	 * the next; -1 walks backwards and slides the previous card back on.
	 * `from` carries the drag offset so a thrown card continues from where the
	 * finger left it instead of snapping back to centre first.
	 */
	function advance(dir: 1 | -1, from?: { dx: number; dy: number; dr: number }) {
		if (!canCycle) return;

		clearTimers();
		// A queued exit is resolved immediately rather than dropped, so rapid
		// clicks never strand a card halfway across the viewport.
		leaving = null;
		entering = 0;

		if ($reducedMotion) {
			activeIndex = (activeIndex + (dir === 1 ? 1 : count - 1)) % count;
			return;
		}

		if (dir === 1) {
			leaving = {
				project: projects[activeIndex],
				dir: from && from.dx < 0 ? -1 : 1,
				dx: from?.dx ?? 0,
				dy: from?.dy ?? 0,
				dr: from?.dr ?? 0
			};
			activeIndex = (activeIndex + 1) % count;
			exitTimer = setTimeout(() => (leaving = null), EXIT_MS);
		} else {
			activeIndex = (activeIndex - 1 + count) % count;
			entering = -1;
			enterTimer = setTimeout(() => (entering = 0), EXIT_MS);
		}
	}

	export function next() {
		advance(1);
	}
	export function prev() {
		advance(-1);
	}

	function goTo(index: number) {
		if (index === activeIndex || !canCycle) return;
		// Always walk forward so the lift-off motion reads consistently.
		advance(index > activeIndex ? 1 : -1);
		activeIndex = index;
	}

	/* ---- Drag ------------------------------------------------------------ */

	function applyDragTransform() {
		if (!topCardEl) return;
		const rotation = dx * 0.045;
		const lift = Math.min(Math.abs(dx) * 0.06, 14);
		topCardEl.style.transform = `translate3d(${dx}px, ${dy - lift}px, 0) rotate(${rotation}deg)`;
	}

	function resetDragTransform() {
		if (!topCardEl) return;
		topCardEl.style.transform = '';
		topCardEl.style.transition = '';
	}

	function onPointerDown(event: PointerEvent) {
		if (!canCycle || $reducedMotion || leaving) return;
		if (event.pointerType === 'mouse' && event.button !== 0) return;

		pointerId = event.pointerId;
		startX = event.clientX;
		startY = event.clientY;
		startTime = performance.now();
		dx = 0;
		dy = 0;
		axisLocked = 'none';
		dragging = true;

		if (topCardEl) topCardEl.style.transition = 'none';
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;

		const nextDx = event.clientX - startX;
		const nextDy = event.clientY - startY;

		// Decide once whether this gesture belongs to the stack or to the page.
		// Vertical intent is handed back to the browser so the section still
		// scrolls normally under a thumb.
		if (axisLocked === 'none') {
			if (Math.abs(nextDx) > 8 || Math.abs(nextDy) > 8) {
				axisLocked = Math.abs(nextDx) > Math.abs(nextDy) ? 'x' : 'y';
				if (axisLocked === 'x') topCardEl?.setPointerCapture(event.pointerId);
			}
		}

		if (axisLocked !== 'x') {
			if (axisLocked === 'y') endDrag(false);
			return;
		}

		dx = nextDx;
		// Vertical follow is damped — the card should feel hinged, not loose.
		dy = nextDy * 0.35;
		applyDragTransform();
	}

	function endDrag(commit: boolean) {
		if (!dragging) return;

		const elapsed = Math.max(performance.now() - startTime, 1);
		const velocity = dx / elapsed;
		const shouldThrow =
			commit && (Math.abs(dx) > DRAG_COMMIT_PX || Math.abs(velocity) > DRAG_COMMIT_VELOCITY);

		if (topCardEl && pointerId !== null && topCardEl.hasPointerCapture?.(pointerId)) {
			topCardEl.releasePointerCapture(pointerId);
		}

		dragging = false;
		pointerId = null;

		if (shouldThrow) {
			const thrown = { dx, dy, dr: dx * 0.045 };
			resetDragTransform();
			advance(1, thrown);
		} else {
			// Spring back to the deck.
			if (topCardEl) {
				topCardEl.style.transition = `transform var(--dur-slow) var(--ease-spring)`;
				topCardEl.style.transform = '';
				const el = topCardEl;
				setTimeout(() => {
					if (el) el.style.transition = '';
				}, 520);
			}
		}

		dx = 0;
		dy = 0;
		axisLocked = 'none';
	}

	function onPointerUp(event: PointerEvent) {
		if (event.pointerId !== pointerId) return;
		endDrag(true);
	}

	function onPointerCancel() {
		endDrag(false);
	}

	function onKeydown(event: KeyboardEvent) {
		if (!canCycle) return;
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			advance(1);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			advance(-1);
		}
	}

	/**
	 * `bind:this` inside the keyed each would latch onto whichever card rendered
	 * last, not the one on top. This action tracks the reference explicitly so
	 * the drag handlers always address the card the pointer is actually on.
	 */
	function trackTop(node: HTMLElement, isTop: boolean) {
		if (isTop) topCardEl = node;
		return {
			update(next: boolean) {
				if (next) topCardEl = node;
				else if (topCardEl === node) topCardEl = null;
			},
			destroy() {
				if (topCardEl === node) topCardEl = null;
			}
		};
	}

	$effect(() => {
		if (!stackEl) return;
		const observer = new IntersectionObserver(([entry]) => (isVisible = entry.isIntersecting), {
			threshold: 0
		});
		observer.observe(stackEl);
		return () => observer.disconnect();
	});

	onDestroy(() => {
		clearTimers();
		if (autoTimer) clearInterval(autoTimer);
	});
</script>

{#if count > 0}
	<div
		class="stack-block {device}"
		bind:this={stackEl}
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
		onfocusin={() => (focusWithin = true)}
		onfocusout={() => (focusWithin = false)}
		role="group"
		aria-roledescription="carousel"
		aria-label={label}
	>
		<!--
			Focusable so keyboard users can reach the deck itself and browse with the
			arrow keys, not only via the arrow buttons below it.

			The compiler flags `role="group"` as non-interactive, but this deck really
			is an interactive control — it is drag-operated with pointer events and
			responds to arrow keys — so a tab stop and a key handler are correct here.
		-->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="deck"
			class:is-dragging={dragging}
			tabindex="0"
			role="group"
			aria-label="{label}. Use the left and right arrow keys to browse."
			onkeydown={onKeydown}
		>
			<!-- The card currently flying off the top of the deck. -->
			{#if leaving}
				<article
					class="card is-leaving"
					data-dir={leaving.dir}
					style="--from-x:{leaving.dx}px; --from-y:{leaving.dy}px; --from-r:{leaving.dr}deg;"
					aria-hidden="true"
				>
					{@render cardBody(leaving.project, true)}
				</article>
			{/if}

			{#each visible as item (item.project.id)}
				<article
					class="card"
					class:is-top={item.depth === 0}
					class:is-entering={item.depth === 0 && entering === -1}
					style="--depth:{item.depth}; --rot:{item.depth === 0
						? 0
						: item.depth % 2
							? -1.5
							: 1.2}deg; z-index:{visibleCount - item.depth};"
					aria-hidden={item.depth !== 0}
					inert={item.depth !== 0}
					use:trackTop={item.depth === 0}
					onpointerdown={item.depth === 0 ? onPointerDown : undefined}
					onpointermove={item.depth === 0 ? onPointerMove : undefined}
					onpointerup={item.depth === 0 ? onPointerUp : undefined}
					onpointercancel={item.depth === 0 ? onPointerCancel : undefined}
				>
					{#if item.depth === 0}
						{@render cardBody(item.project, true)}
					{:else}
						<!--
							Buried cards render as bare surfaces. Only a 30–50px ledge of them
							is ever visible, and showing real content there produced a ghosted
							second copy of the top card's text. Blank edges read as a physical
							stack — and skipping the markup avoids mounting screenshots and
							text for cards nobody can read.
						-->
						<span class="card-ghost" aria-hidden="true"></span>
					{/if}
				</article>
			{/each}
		</div>

		<!-- Controls -->
		<div class="controls">
			<div class="counter" aria-live="polite">
				<span class="now">{String(activeIndex + 1).padStart(2, '0')}</span>
				<span class="sep">/</span>
				<span class="total">{String(count).padStart(2, '0')}</span>
			</div>

			{#if canCycle}
				<div class="dots" role="tablist" aria-label="Choose a project">
					{#each projects as project, index}
						<button
							type="button"
							role="tab"
							class="dot"
							class:active={index === activeIndex}
							aria-selected={index === activeIndex}
							aria-label={project.name}
							onclick={() => goTo(index)}
						></button>
					{/each}
				</div>

				<div class="arrows">
					<button type="button" class="arrow" onclick={() => advance(-1)} aria-label="Previous project">
						<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</button>
					<button type="button" class="arrow" onclick={() => advance(1)} aria-label="Next project">
						<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M9 18l6-6-6-6" />
						</svg>
					</button>
				</div>
			{/if}
		</div>

		{#if canCycle}
			<p class="kbd-hint" aria-hidden="true">
				<kbd>←</kbd><kbd>→</kbd>
				<span>or drag a card off the pile</span>
			</p>
		{/if}
	</div>
{/if}

{#snippet cardBody(project: StackProject, interactive: boolean)}
	<div class="card-inner">
		<div class="stage">
			<DeviceFrame
				variant={device}
				src={project.screenshot}
				fallbackSrc={project.screenshotFallback}
				alt="{project.name} screenshot"
				url={project.detailsLink}
				loading={interactive ? 'eager' : 'lazy'}
			/>
		</div>

		<div class="body">
			<div class="meta">
				<span class="year">{project.year}</span>
				<span class="meta-line"></span>
			</div>

			<h3 class="name">{project.name}</h3>
			<p class="subtitle">{project.subtitle}</p>
			<p class="desc">{project.description}</p>

			{#if project.technologies?.length}
				<ul class="chips tech">
					{#each project.technologies.slice(0, 5) as item}
						<li>{item}</li>
					{/each}
				</ul>
			{/if}

			<div class="actions">
				<button
					type="button"
					class="btn primary"
					tabindex={interactive ? 0 : -1}
					onclick={() => onselect?.(project)}
				>
					Case details
					<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5 12h14M13 6l6 6-6 6" />
					</svg>
				</button>

				{#if project.detailsLink && project.detailsLink !== '#'}
					<a
						class="btn ghost"
						href={project.detailsLink}
						target="_blank"
						rel="noopener noreferrer"
						tabindex={interactive ? 0 : -1}
					>
						<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.19.7.8.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
						</svg>
						Source
					</a>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<style>
	.stack-block {
		position: relative;
		width: 100%;
	}

	/* ---- Deck ------------------------------------------------------------ */

	.deck {
		position: relative;
		width: 100%;
		/* Room below and to the sides for the peeking cards and the lift-off
		   arc, so neither is clipped by the section. */
		padding: 0.75rem 0 3rem;
		perspective: 1600px;
	}

	.card {
		position: absolute;
		inset: 0.75rem 0 3rem;
		border-radius: var(--r-lg);
		background: var(--bg-elev-1);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		/* Anchored at the bottom edge so scaling a buried card shortens it from
		   the top, leaving a clean ledge below rather than shrinking inward. */
		transform-origin: 50% 100%;
		/* Cards deeper in the pile sit lower, narrower, and tilt alternately —
		   the tell that this is a physical stack and not a plain carousel. */
		transform: translate3d(0, calc(var(--depth) * 18px), 0)
			scale(calc(1 - var(--depth) * 0.05)) rotate(var(--rot, 0deg));
		transition:
			transform var(--dur-slow) var(--ease-out),
			opacity var(--dur-slow) var(--ease-out),
			box-shadow var(--dur-slow) var(--ease-out);
		will-change: transform;
	}

	/* The first card is the only one in flow — it gives the deck its height. */
	.card.is-top {
		position: relative;
		inset: auto;
	}

	.card:not(.is-top) {
		pointer-events: none;
	}

	/* `pan-y` hands vertical gestures back to the browser, so the page still
	   scrolls under a thumb while horizontal drags belong to the deck. */
	.card.is-top {
		cursor: grab;
		touch-action: pan-y;
	}

	.deck:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 8px;
		border-radius: var(--r-lg);
	}

	:global(:root.dark) .card {
		box-shadow: var(--shadow-lg), var(--accent-glow, none);
	}

	.deck.is-dragging .card.is-top {
		cursor: grabbing;
		transition: none;
		box-shadow: var(--shadow-xl);
	}

	/* Lift-off: rise and tilt first, then travel away — the arc a hand makes
	   taking the top book off a pile. */
	.card.is-leaving {
		position: absolute;
		inset: 0.75rem 0 3rem;
		z-index: 20;
		pointer-events: none;
		animation: lift-off var(--exit-duration, 620ms) var(--ease-in-out) forwards;
	}

	.card.is-leaving[data-dir='-1'] {
		animation-name: lift-off-left;
	}

	@keyframes lift-off {
		0% {
			transform: translate3d(var(--from-x, 0), var(--from-y, 0), 0) rotate(var(--from-r, 0deg));
			opacity: 1;
		}
		28% {
			transform: translate3d(calc(var(--from-x, 0px) + 2%), -5%, 60px) rotate(5deg) scale(1.02);
			opacity: 1;
		}
		100% {
			transform: translate3d(128%, -13%, 0) rotate(17deg) scale(0.93);
			opacity: 0;
		}
	}

	@keyframes lift-off-left {
		0% {
			transform: translate3d(var(--from-x, 0), var(--from-y, 0), 0) rotate(var(--from-r, 0deg));
			opacity: 1;
		}
		28% {
			transform: translate3d(calc(var(--from-x, 0px) - 2%), -5%, 60px) rotate(-5deg) scale(1.02);
			opacity: 1;
		}
		100% {
			transform: translate3d(-128%, -13%, 0) rotate(-17deg) scale(0.93);
			opacity: 0;
		}
	}

	/* Walking backwards slides the previous card back onto the pile. */
	.card.is-entering {
		animation: settle-back var(--exit-duration, 620ms) var(--ease-out) backwards;
	}

	@keyframes settle-back {
		0% {
			transform: translate3d(-120%, -12%, 0) rotate(-15deg) scale(0.93);
			opacity: 0;
		}
		100% {
			transform: none;
			opacity: 1;
		}
	}

	/* ---- Card content ---------------------------------------------------- */

	/* Faint sheen on a buried card so the pile has depth without any content. */
	.card-ghost {
		display: block;
		width: 100%;
		height: 100%;
		background: linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1));
	}

	/* Content fades in as a card is promoted to the top of the pile, so the
	   switch from bare surface to full card does not snap. */
	.card.is-top .card-inner {
		animation: content-in 380ms var(--ease-out) both;
	}

	@keyframes content-in {
		from {
			opacity: 0;
		}
	}

	.card-inner {
		display: grid;
		grid-template-columns: 1fr;
		gap: clamp(1.25rem, 3vw, 2rem);
		height: 100%;
		padding: clamp(1.25rem, 3vw, 2rem);
		align-content: start;
	}

	.stage {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 0;
	}

	.phone .stage :global(.device) {
		width: min(190px, 52vw);
	}

	.browser .stage :global(.device) {
		width: 100%;
	}

	.body {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		margin-bottom: var(--sp-3);
	}

	.year {
		font-family: var(--font-display);
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--accent-ink);
		font-variant-numeric: tabular-nums;
	}

	.meta-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, var(--line-strong), transparent);
	}

	.name {
		font-family: var(--font-display);
		font-size: clamp(1.4rem, 3.2vw, 2rem);
		font-weight: 700;
		letter-spacing: var(--tracking-head);
		line-height: 1.1;
	}

	.subtitle {
		margin-top: 0.35rem;
		font-size: var(--fs-sm);
		font-weight: 500;
		color: var(--accent-ink);
	}

	.desc {
		margin-top: var(--sp-4);
		font-size: var(--fs-sm);
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		list-style: none;
		margin-top: var(--sp-4);
	}

	.chips li {
		padding: 0.25rem 0.65rem;
		border-radius: var(--r-pill);
		font-size: var(--fs-xs);
		font-weight: 500;
		line-height: 1.5;
		white-space: nowrap;
	}

	.chips.tech li {
		background: var(--accent-wash);
		color: var(--accent-ink);
		border: 1px solid var(--accent-edge);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: auto;
		padding-top: var(--sp-5);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.6rem 1.1rem;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		font-size: var(--fs-sm);
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		transition:
			transform var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.btn.primary {
		background: var(--text);
		color: var(--bg);
	}

	.btn.primary svg {
		transition: transform var(--dur-base) var(--ease-out);
	}

	.btn.primary:hover svg {
		transform: translateX(3px);
	}

	.btn.ghost {
		background: transparent;
		color: var(--text-muted);
		border-color: var(--line-strong);
	}

	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--text-subtle);
	}

	.btn:hover {
		transform: translateY(-1px);
	}

	.btn:active {
		transform: translateY(0);
	}

	/* ---- Controls -------------------------------------------------------- */

	.controls {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		margin-top: var(--sp-5);
	}

	.counter {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--text-subtle);
	}

	.counter .now {
		color: var(--text);
		font-size: var(--fs-body);
	}

	.dots {
		display: flex;
		gap: 0.4rem;
		flex: 1;
		flex-wrap: wrap;
	}

	.dot {
		width: 22px;
		height: 4px;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: var(--line-strong);
		cursor: pointer;
		transition:
			background-color var(--dur-base) var(--ease-out),
			width var(--dur-base) var(--ease-out);
	}

	.dot:hover {
		background: var(--text-subtle);
	}

	.dot.active {
		width: 34px;
		background: var(--accent);
	}

	.arrows {
		display: flex;
		gap: 0.4rem;
	}

	.arrow {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		border: 1px solid var(--line-strong);
		background: var(--bg-elev-1);
		color: var(--text-muted);
		cursor: pointer;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
	}

	.arrow:hover {
		background: var(--text);
		color: var(--bg);
		border-color: var(--text);
		transform: translateY(-1px);
	}

	.kbd-hint {
		display: none;
		align-items: center;
		gap: 0.4rem;
		margin-top: var(--sp-4);
		font-size: var(--fs-xs);
		color: var(--text-subtle);
		width: fit-content;
	}

	.kbd-hint kbd {
		display: inline-grid;
		place-items: center;
		min-width: 22px;
		height: 22px;
		padding-inline: 0.3rem;
		border: 1px solid var(--line-strong);
		border-bottom-width: 2px;
		border-radius: var(--r-xs);
		background: var(--bg-inset);
		color: var(--text-muted);
		/* System UI first — the arrow glyphs are missing from some webfont
		   subsets and would otherwise render as blank boxes. */
		font-family: system-ui, 'Segoe UI Symbol', var(--font-body);
		font-size: 0.8rem;
		line-height: 1;
	}

	/* ---- Layout ---------------------------------------------------------- */

	@media (min-width: 860px) {
		.kbd-hint {
			display: inline-flex;
		}

		.phone .card-inner {
			grid-template-columns: minmax(200px, 250px) 1fr;
			align-items: center;
		}

		.phone .stage :global(.device) {
			width: 100%;
			max-width: 240px;
		}

		.browser .card-inner {
			grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
			align-items: center;
		}

		.desc {
			-webkit-line-clamp: 4;
			line-clamp: 4;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
		.card.is-leaving,
		.card.is-entering,
		.card.is-top .card-inner {
			animation: none;
		}
	}
</style>
