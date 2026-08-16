<script lang="ts">
	import { onDestroy } from 'svelte';
	import { reducedMotion } from '$lib/stores/motion';
	import DeviceFrame from '$lib/components/ui/DeviceFrame.svelte';
	import { tilt } from '$lib/actions/tilt';
	import { ripple } from '$lib/actions/ripple';

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
	/**
	 * How deep the pile is mounted at all. Two cards: the top one, and the one
	 * directly under it in full — content laid out, screenshot fetched — so a
	 * swipe uncovers a finished card rather than a blank surface that populates
	 * afterwards.
	 *
	 * Nothing deeper exists in the DOM. A card at depth 2 shows about 18px of
	 * ledge and nothing else, which `.deck::after` draws for the cost of one
	 * gradient rather than a whole article and its subtree. A project mounts
	 * when it reaches second place, which gives it a full dwell — or a swipe —
	 * to load before anyone can actually read it.
	 */
	const MOUNTED_DEPTH = 1;

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
	let deckEl = $state<HTMLElement | null>(null);
	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let startTime = 0;
	let dx = 0;
	let dy = 0;
	let axisLocked: 'none' | 'x' | 'y' = 'none';
	let dragRaf = 0;
	/** Commit distance for the current gesture, sized to the card (see onPointerDown). */
	let commitPx = DRAG_COMMIT_PX;

	let exitTimer: ReturnType<typeof setTimeout> | null = null;
	let enterTimer: ReturnType<typeof setTimeout> | null = null;
	let autoTimer: ReturnType<typeof setInterval> | null = null;

	const count = $derived(projects.length);
	const visibleCount = $derived(Math.min(MOUNTED_DEPTH + 1, count));
	/* The drawn third ledge is only honest if there is actually another
	   project behind the two that are mounted. */
	const hasLedge = $derived(count > visibleCount);

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

	/**
	 * Writes the drag to the DOM. Coalesced onto a frame because pointermove
	 * fires well above 60Hz on a phone — without this the same frame gets its
	 * transform rewritten several times over, which is wasted work on the one
	 * device least able to afford it.
	 */
	function applyDragTransform() {
		if (dragRaf) return;
		dragRaf = requestAnimationFrame(() => {
			dragRaf = 0;
			if (!topCardEl) return;
			const rotation = dx * 0.045;
			const lift = Math.min(Math.abs(dx) * 0.06, 14);
			topCardEl.style.transform = `translate3d(${dx}px, ${dy - lift}px, 0) rotate(${rotation}deg)`;
			/* How far the card behind should have risen out of the pile: it
			   comes up to meet the gesture instead of waiting for the throw to
			   land, so the next project is already sitting square by the time
			   the top one clears. */
			setPeek(Math.min(1, Math.abs(dx) / commitPx));
		});
	}

	function setPeek(value: number) {
		deckEl?.style.setProperty('--peek', value.toFixed(3));
	}

	function resetDragTransform() {
		if (dragRaf) {
			cancelAnimationFrame(dragRaf);
			dragRaf = 0;
		}
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

		/* A fixed 96px is a fifth of a desktop card but well over a quarter of
		   a phone one, which makes the same gesture feel much heavier on the
		   smaller screen. Scale it to the card and keep 96 as the ceiling. */
		const width = topCardEl?.offsetWidth ?? 0;
		commitPx = width ? Math.max(48, Math.min(DRAG_COMMIT_PX, width * 0.2)) : DRAG_COMMIT_PX;

		if (topCardEl) topCardEl.style.transition = 'none';

		/* The card only captures the pointer once the gesture commits to the
		   horizontal axis, so until then a release outside it would never
		   reach these handlers and the deck would stay stuck mid-drag. */
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerCancel);
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
			commit && (Math.abs(dx) > commitPx || Math.abs(velocity) > DRAG_COMMIT_VELOCITY);

		if (topCardEl && pointerId !== null && topCardEl.hasPointerCapture?.(pointerId)) {
			topCardEl.releasePointerCapture(pointerId);
		}

		window.removeEventListener('pointerup', onPointerUp);
		window.removeEventListener('pointercancel', onPointerCancel);

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

		/* Either way the pile is back to rest: on a throw the card behind is
		   promoted and stops reading --peek, on a spring-back it eases down
		   with the transition that the dropped is-dragging class restores. */
		setPeek(0);

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

	/**
	 * Only the top card is in flow, so the deck is as tall as whichever project
	 * is showing — and they are not all the same height, since each device
	 * frame fits its own screenshot's shape. Advancing therefore moved
	 * everything below the deck by up to ~85px.
	 *
	 * Latching the tallest height seen holds the block steady. It only ever
	 * grows, and a min-height below the card's natural height does nothing, so
	 * measuring the deck again after setting it cannot feed back. Deliberately
	 * not `$state`: this writes to the DOM directly, and routing it through the
	 * template would make the effect depend on the value it sets.
	 */
	let deckMin = 0;
	let lastCardH = 0;

	/**
	 * A buried card is held to the top card's height, and its own content is
	 * frequently taller — different screenshots, different frame shapes. Left
	 * alone, `overflow: hidden` cuts it off, and the cut lands exactly in the
	 * ~18px ledge that shows under the top card, putting a slice of the next
	 * project's chips and buttons on display.
	 *
	 * So the whole canvas is scaled down to fit instead. `--fit` is the factor
	 * that makes it, and the CSS ramps it back to 1 as the card rises, so a
	 * card grows into its own natural size as it is promoted rather than
	 * snapping.
	 *
	 * The overflow is measured from the children's own rects, not from
	 * `scrollHeight`: `.card-inner` is a grid with visible overflow, and
	 * scrollHeight badly under-reports how far a taller device frame actually
	 * hangs past the box — it gave 18px where the real overhang was nearer 60,
	 * so the first version of this still leaked a strip of screenshot into the
	 * ledge. `--fit` is reset to 1 before measuring so the rects describe the
	 * natural layout rather than the last scale applied to it.
	 */
	function applyFits() {
		if (!deckEl) return;

		/* Read the top card from the DOM rather than from `topCardEl`, which is
		   maintained by the `trackTop` action and is not guaranteed to have been
		   updated by the time this effect runs. Using the stale reference meant
		   the promoted card only got its scale reset when a ResizeObserver
		   happened to fire afterwards — the growth worked, but by luck. */
		const top = deckEl.querySelector<HTMLElement>('.card.is-top');
		if (!top) return;
		const cardH = top.offsetHeight;
		if (!cardH) return;

		if (cardH !== lastCardH) {
			lastCardH = cardH;
			deckEl.style.setProperty('--card-h', `${cardH}px`);
		}

		/* The card just promoted still carries the scale it wore underneath.
		   Writing 1 here is what the transition animates from. */
		top.style.setProperty('--fit', '1');

		for (const card of deckEl.querySelectorAll<HTMLElement>(
			'.card:not(.is-top):not(.is-leaving)'
		)) {
			const inner = card.querySelector<HTMLElement>('.card-inner');
			if (!inner) continue;

			card.style.setProperty('--fit', '1');
			const box = inner.getBoundingClientRect();
			let contentBottom = box.top;
			for (const child of inner.children) {
				contentBottom = Math.max(contentBottom, child.getBoundingClientRect().bottom);
			}

			/* Include the bottom padding in what has to fit, so the strip the
			   ledge exposes is padding rather than the last row of content. */
			const padding = parseFloat(getComputedStyle(inner).paddingBottom) || 0;
			const needed = contentBottom - box.top + padding;
			const fit = needed > box.height ? box.height / needed : 1;
			card.style.setProperty('--fit', fit.toFixed(4));
		}
	}

	$effect(() => {
		activeIndex;
		if (!deckEl) return;

		const height = deckEl.offsetHeight;
		if (height > deckMin) {
			deckMin = height;
			deckEl.style.minHeight = `${height}px`;
		}

		applyFits();

		/* A screenshot that decodes after this pass changes the card's content
		   height, so re-fit when it does rather than leaving a stale scale. */
		const observer = new ResizeObserver(applyFits);
		for (const stage of deckEl.querySelectorAll('.card .stage')) observer.observe(stage);
		return () => observer.disconnect();
	});

	/* A latch learned at one width is meaningless at another — a narrow layout
	   makes every card taller. */
	$effect(() => {
		const onResize = () => {
			deckMin = 0;
			lastCardH = 0;
			if (deckEl) deckEl.style.minHeight = '';
			applyFits();
		};
		window.addEventListener('resize', onResize, { passive: true });
		return () => window.removeEventListener('resize', onResize);
	});

	onDestroy(() => {
		clearTimers();
		if (autoTimer) clearInterval(autoTimer);
		if (dragRaf) cancelAnimationFrame(dragRaf);
		if (typeof window !== 'undefined') {
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerCancel);
		}
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
			class:has-ledge={hasLedge}
			bind:this={deckEl}
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
					{@render cardBody(leaving.project, false, true)}
				</article>
			{/if}

			{#each visible as item (item.project.id)}
				<article
					class="card"
					class:is-top={item.depth === 0}
					class:is-entering={item.depth === 0 && entering === -1}
					style="--depth:{item.depth}; --lift:{item.depth === MOUNTED_DEPTH
						? 1
						: 0}; --rot:{item.depth === 0 ? 0 : -1.5}deg; z-index:{visibleCount -
						item.depth};"
					aria-hidden={item.depth !== 0}
					inert={item.depth !== 0}
					use:trackTop={item.depth === 0}
					onpointerdown={item.depth === 0 ? onPointerDown : undefined}
					onpointermove={item.depth === 0 ? onPointerMove : undefined}
					onpointerup={item.depth === 0 ? onPointerUp : undefined}
					onpointercancel={item.depth === 0 ? onPointerCancel : undefined}
				>
					<!--
						Both mounted cards are real. The second is inert and unreachable,
						but it is laid out and its screenshot is already fetched, so a
						swipe uncovers a finished card instead of one that fills in after
						the fact. Nothing deeper than this is mounted at all.
					-->
					{@render cardBody(item.project, item.depth === 0, true)}
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

{#snippet cardBody(project: StackProject, interactive: boolean, eager: boolean)}
	<div class="card-inner">
		<div class="stage" use:tilt={{ max: 8 }}>
			<DeviceFrame
				variant={device}
				src={project.screenshot}
				fallbackSrc={project.screenshotFallback}
				alt="{project.name} screenshot"
				url={project.detailsLink}
				loading={eager ? 'eager' : 'lazy'}
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
					use:ripple
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
						use:ripple
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
		/*
			Cards deeper in the pile sit lower, narrower, and tilt alternately —
			the tell that this is a physical stack and not a plain carousel.

			`--peek` is the live drag progress (0–1) the deck writes during a
			swipe, and `--lift` marks the single card allowed to answer it. That
			card's effective depth falls toward 0 as the top one is pulled
			aside, so it rises, squares up and loses its tilt in step with the
			gesture rather than snapping into place after the throw lands.
		*/
		--effective-depth: calc(var(--depth) - var(--peek, 0) * var(--lift, 0));
		transform: translate3d(0, calc(var(--effective-depth) * 18px), 0)
			scale(calc(1 - var(--effective-depth) * 0.05))
			rotate(calc(var(--rot, 0deg) * (1 - var(--peek, 0) * var(--lift, 0))));
		transition:
			transform var(--dur-slow) var(--ease-out),
			opacity var(--dur-slow) var(--ease-out),
			box-shadow var(--dur-slow) var(--ease-out);
		will-change: transform;
	}

	/* The first card is the only one in flow — it gives the deck its height. */
	/* The only card in flow, and it takes its own natural height — this is the
	   card being read, so it sizes to its content and the deck follows. */
	.card.is-top {
		position: relative;
		inset: auto;
	}

	.card:not(.is-top) {
		pointer-events: none;
		/* Matched to the card on top rather than filling the deck, which may be
		   holding a taller latched height — see the `--card-h` note in the
		   script. */
		bottom: auto;
		height: var(--card-h, auto);
	}

	/*
		Scales a buried card's whole canvas down to whatever fits the height it
		has been given, so nothing is ever cut off into the visible ledge, and
		ramps back to full size in step with `--peek` as the card rises — so the
		card grows into itself while being uncovered rather than snapping at the
		moment it is promoted. `--lift` restricts that to the one card allowed
		to answer the drag, exactly as the card's own transform does.

		Anchored top-centre: the shrink then takes its slack off the bottom,
		which is precisely the strip the ledge exposes.

		Applied to every card, not only buried ones. Scoping it to
		`:not(.is-top)` meant that on promotion the rule stopped matching, and
		the transform and its transition disappeared in the same frame — so the
		card jumped to full size instead of growing into it. The top card simply
		carries `--fit: 1`, written by `applyFits`, and the transition here
		carries it there.

		Timed to the exit so the card finishes growing just as the one thrown
		off it finishes leaving.
	*/
	.card-inner {
		transform-origin: 50% 0;
		transform: scale(
			calc(var(--fit, 1) + (1 - var(--fit, 1)) * var(--peek, 0) * var(--lift, 0))
		);
		transition: transform var(--exit-duration, 620ms) var(--ease-out);
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

	/* Nothing eases during a drag — both the card under the finger and the one
	   rising behind it are being positioned per frame, and a transition on top
	   of that would only add lag. Dropping the class on release hands both
	   back to the transition above, which is what animates the settle. */
	.deck.is-dragging .card,
	.deck.is-dragging .card-inner {
		transition: none;
	}

	.deck.is-dragging .card.is-top {
		cursor: grabbing;
		box-shadow: var(--shadow-xl);
	}

	/* Lift-off: rise and tilt first, then travel away — the arc a hand makes
	   taking the top book off a pile. */
	/* Its own natural height, not `--card-h`: that property already describes
	   the card that replaced it, and forcing this one to match would resize it
	   at the very moment the throw begins. */
	.card.is-leaving {
		position: absolute;
		inset: 0.75rem 0 auto;
		height: auto;
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

	/*
		The third ledge of the pile — drawn, not mounted.

		A card at this depth is 18px of edge and nothing more, so it does not
		need to be a card: this is the same silhouette, at the same offset and
		tilt a real depth-2 card would have, for one gradient and no subtree.
		`.deck` establishes a stacking context (it has `perspective`), so
		z-index 0 puts it behind both mounted cards.
	*/
	.deck.has-ledge::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 0.75rem;
		height: var(--card-h, auto);
		z-index: 0;
		pointer-events: none;
		border-radius: var(--r-lg);
		background: linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1));
		border: 1px solid var(--line);
		box-shadow: var(--shadow-lg);
		transform-origin: 50% 100%;
		transform: translate3d(0, 36px, 0) scale(0.9) rotate(1.2deg);
	}

	/* ---- Card content ---------------------------------------------------- */

	/*
		No fade on promotion any more. That existed to cover a card switching
		from a bare surface to full content; the card being promoted is now
		already rendered and on screen, so fading it up from nothing would be
		a flash of the very thing it used to hide.
	*/
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
		/* Cursor-follow tilt, driven by src/lib/actions/tilt.ts's --tilt-rx/
		   --tilt-ry. Lives on the stage rather than .card so it never fights
		   the drag transform, which is written straight to .card's inline
		   style during a swipe. */
		transform: perspective(900px) rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg));
		transition: transform var(--tilt-transition, 400ms) var(--ease-out);
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
		transform: translateY(0) scale(0.96);
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
		.card.is-entering {
			animation: none;
		}
	}
</style>
