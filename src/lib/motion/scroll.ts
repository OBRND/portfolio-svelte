import Lenis from 'lenis';
import type { Action } from 'svelte/action';

/**
 * The one scroll engine for the public site.
 *
 * Everything scroll-driven on the page — pinned scrubs, parallax, marquees,
 * the device zoom — hangs off a single requestAnimationFrame loop here rather
 * than each section adding its own scroll listener. That is what keeps the
 * page smooth: one read phase (every tracked element measured together), then
 * one write phase (every style written together), per frame, so no section
 * can force a layout in the middle of another one's work.
 *
 * Lenis supplies the inertial wheel scrolling on mouse and trackpad. Touch
 * devices keep their native scroll (it is already smooth, and replacing it
 * feels wrong), and `prefers-reduced-motion` skips Lenis entirely — in both
 * cases the loop simply follows `window.scrollY` instead.
 */

export interface ScrollState {
	/** Current scroll offset in px. */
	y: number;
	/** Smoothed scroll velocity in px/frame, signed. Decays to 0 at rest. */
	velocity: number;
	vw: number;
	vh: number;
}

export type ProgressMode =
	/** 0 → 1 across a tall track's pinned travel (its height minus one viewport). */
	| 'pin'
	/** 0 → 1 from the element's top entering the viewport bottom to its bottom leaving the top. */
	| 'view'
	/** 0 → 1 while the element's top travels from the viewport bottom to the viewport top. */
	| 'enter';

export interface ProgressOptions {
	mode?: ProgressMode;
	/** Custom property written on the node. Defaults to `--p`. */
	cssVar?: string | null;
	/** Called whenever progress changes, and once on registration. */
	onUpdate?: (progress: number, state: ScrollState) => void;
}

interface Tracked {
	node: HTMLElement;
	opts: ProgressOptions;
	top: number;
	height: number;
	last: number;
}

type Ticker = (state: ScrollState) => void;
type SnapSource = () => number[];

const state: ScrollState = { y: 0, velocity: 0, vw: 0, vh: 0 };
const tracked = new Set<Tracked>();
const tickers = new Set<Ticker>();
const snapSources = new Set<SnapSource>();

let lenis: Lenis | null = null;
let raf = 0;
let running = false;
let lastY = -1;
let forceFrame = true;

// Snap bookkeeping.
let lastMoveAt = 0;
let snapPending = false;
let pointerIsFine = false;
/** Sign of the last real movement: 1 down the page, -1 up it. */
let lastDir = 0;

/**
 * A hidden element one CSS `100vh` tall. On a phone that is the viewport with
 * the browser's toolbar tucked away, and it does not change when the toolbar
 * slides in and out — unlike `innerHeight`, which does, mid-scroll. The pinned
 * stages are sized in `vh`, so their travel has to be measured in it too, or
 * every scene jumps a little each time the toolbar moves.
 */
let probe: HTMLElement | null = null;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function measureViewport() {
	const vw = window.innerWidth;
	const vh = probe?.offsetHeight || window.innerHeight;
	if (vw === state.vw && vh === state.vh) return;
	state.vw = vw;
	state.vh = vh;
	forceFrame = true;
}

function computeProgress(item: Tracked): number {
	const { top, height } = item;
	const { vh } = state;
	switch (item.opts.mode ?? 'pin') {
		case 'view':
			return clamp01((vh - top) / (vh + height));
		case 'enter':
			return clamp01((vh - top) / vh);
		default: {
			const travel = height - vh;
			return travel <= 0 ? (top <= 0 ? 1 : 0) : clamp01(-top / travel);
		}
	}
}

function frame(time: number) {
	raf = requestAnimationFrame(frame);
	lenis?.raf(time);

	const y = lenis ? lenis.scroll : window.scrollY;
	const delta = lastY < 0 ? 0 : y - lastY;
	state.velocity += (delta - state.velocity) * 0.14;
	if (Math.abs(state.velocity) < 0.01) state.velocity = 0;
	state.y = y;

	const moved = Math.abs(delta) > 0.01;
	if (moved) {
		lastMoveAt = time;
		snapPending = true;
		lastDir = delta > 0 ? 1 : -1;
	}

	// At rest there is nothing to recompute; skip the whole frame.
	if (moved || forceFrame || state.velocity !== 0) {
		forceFrame = false;

		// Read phase.
		for (const item of tracked) {
			const rect = item.node.getBoundingClientRect();
			item.top = rect.top;
			item.height = rect.height;
		}

		// Write phase.
		for (const item of tracked) {
			const p = computeProgress(item);
			if (Math.abs(p - item.last) < 0.0002 && item.last !== -1) continue;
			item.last = p;
			const name = item.opts.cssVar === undefined ? '--p' : item.opts.cssVar;
			if (name) item.node.style.setProperty(name, p.toFixed(4));
			item.opts.onUpdate?.(p, state);
		}

		for (const tick of tickers) tick(state);
	}

	lastY = y;

	if (snapPending && lenis && pointerIsFine && time - lastMoveAt > 160) {
		snapPending = false;
		settleToSnap();
	}
}

/**
 * Proximity snapping. Sections register the scroll offsets that are their
 * "resting" frames; once scrolling has stopped, the page glides to the nearest
 * one — but only if it is already close. Anything further away is left alone,
 * so this never fights a deliberate scroll or traps the reader in a section.
 *
 * It only ever pulls the way the reader was already going. A point they have
 * just scrolled away from is behind them, and gliding back to it undid every
 * small scroll out of a pinned scene: it took one long, unbroken swipe to
 * leave. The exception is the last few pixels of an overshoot.
 */
function settleToSnap() {
	if (!lenis) return;
	const y = lenis.scroll;
	const limit = state.vh * 0.2;
	let best = Infinity;
	let target = 0;
	for (const source of snapSources) {
		for (const point of source()) {
			const d = point - y;
			if (Math.abs(d) < Math.abs(best)) {
				best = d;
				target = point;
			}
		}
	}
	if (Math.abs(best) < 2 || Math.abs(best) > limit) return;
	const behind = lastDir !== 0 && Math.sign(best) !== lastDir;
	if (behind && Math.abs(best) > state.vh * 0.04) return;
	lenis.scrollTo(target, {
		duration: 0.9,
		easing: (t) => 1 - Math.pow(1 - t, 4)
	});
}

/** Starts the engine. Returns a teardown. Safe to call once from the layout. */
export function startScroll(): () => void {
	if (running || typeof window === 'undefined') return () => {};
	running = true;

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	pointerIsFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	if (!reduced) {
		lenis = new Lenis({
			lerp: 0.085,
			wheelMultiplier: 0.95,
			smoothWheel: true,
			syncTouch: false,
			autoRaf: false
		});
	}

	probe = document.createElement('div');
	probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;visibility:hidden;pointer-events:none';
	document.body.appendChild(probe);

	measureViewport();
	window.addEventListener('resize', measureViewport);

	// Fonts and images shift layout after first paint; remeasure when they do.
	const resize = new ResizeObserver(() => {
		forceFrame = true;
	});
	resize.observe(document.body);

	lastY = -1;
	raf = requestAnimationFrame(frame);

	return () => {
		running = false;
		cancelAnimationFrame(raf);
		window.removeEventListener('resize', measureViewport);
		resize.disconnect();
		probe?.remove();
		probe = null;
		lenis?.destroy();
		lenis = null;
	};
}

/** Scrolls to an element, selector or offset through the engine. */
export function scrollTo(
	target: string | number | HTMLElement,
	options: { offset?: number; immediate?: boolean; duration?: number } = {}
) {
	if (typeof window === 'undefined') return;
	if (lenis) {
		lenis.scrollTo(target, {
			offset: options.offset ?? 0,
			immediate: options.immediate,
			duration: options.duration ?? 1.5,
			easing: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2)
		});
		return;
	}

	let top = 0;
	if (typeof target === 'number') top = target;
	else {
		const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
		if (!el) return;
		top = el.getBoundingClientRect().top + window.scrollY;
	}
	window.scrollTo({ top: top + (options.offset ?? 0), behavior: 'auto' });
}

/** Freezes / releases page scrolling — used while the menu overlay is open. */
export function lockScroll(locked: boolean) {
	if (typeof document === 'undefined') return;
	if (lenis) {
		if (locked) lenis.stop();
		else lenis.start();
	}
	document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/** Runs `fn` on every active frame. Returns an unsubscribe. */
export function onFrame(fn: Ticker): () => void {
	tickers.add(fn);
	forceFrame = true;
	return () => tickers.delete(fn);
}

/** Registers resting scroll offsets for proximity snapping. */
export function addSnap(source: SnapSource): () => void {
	snapSources.add(source);
	return () => snapSources.delete(source);
}

/** Asks for one recompute on the next frame — after a layout change. */
export function refresh() {
	forceFrame = true;
}

export function getScrollState(): ScrollState {
	return state;
}

/**
 * `use:progress` — tracks an element's travel through the viewport and writes
 * it to a custom property (`--p` by default), so the animation itself can live
 * in CSS as `calc()` on that one number.
 */
export const progress: Action<HTMLElement, ProgressOptions | undefined> = (node, opts = {}) => {
	const item: Tracked = { node, opts, top: 0, height: 0, last: -1 };
	tracked.add(item);
	forceFrame = true;

	return {
		update(next = {}) {
			item.opts = next;
			item.last = -1;
			forceFrame = true;
		},
		destroy() {
			tracked.delete(item);
		}
	};
};

/** Absolute document offset of an element's top edge. */
export function docTop(node: HTMLElement): number {
	return node.getBoundingClientRect().top + (lenis ? lenis.scroll : window.scrollY);
}
