import type { Action } from 'svelte/action';

export interface PointerOrbitOptions {
	/** Peak yaw/pitch in degrees, reached when the pointer is at the edge of its reach. */
	max?: number;
	/** How far the pull still registers, as a multiple of the node's own size. */
	reach?: number;
	/** Degrees of orbital swirl added per degree the pointer sweeps around the centre. */
	swirl?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Orbit-control style pointer tracking for the portrait.
 *
 * Two separate things come out of one pointer path:
 *
 *  - `--tilt-rx` / `--tilt-ry`, the yaw and pitch the node turns to face the
 *    cursor. These are run through a spring rather than a CSS transition, so
 *    the motion has weight and a little overshoot — it settles into place
 *    instead of snapping — and, more importantly, the transform is written
 *    once per frame instead of restarting a transition on every pointermove.
 *    A restarted transition is what makes the older approach stutter: each
 *    event interrupts the last one mid-flight and forces the browser to
 *    re-promote the layer.
 *
 *  - `--orbit-spin`, an impulse taken from how far the pointer swept *around*
 *    the node, not how fast it moved. Circling the portrait winds the orbits
 *    the way you'd spin a globe with a finger; a flick gives them a kick that
 *    bleeds off and returns them to their own steady precession.
 *
 * Geometry is measured lazily and only re-measured when something invalidates
 * it, never inside the frame loop — reading a rect there would force a layout
 * on an element that is being transformed on that same frame.
 *
 * Mouse only: `hover: hover` and `pointer: fine` both have to hold, and
 * reduced-motion opts out entirely.
 */
export const pointerOrbit: Action<HTMLElement, PointerOrbitOptions | undefined> = (
	node,
	options = {}
) => {
	let max = options.max ?? 7;
	let reach = options.reach ?? 2.4;
	let swirl = options.swirl ?? 0.35;

	const fine =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	if (!fine || reduced) return {};

	/* Target, in -1..1 on each axis. */
	let targetX = 0;
	let targetY = 0;
	/* Animated state chasing it. */
	let curX = 0;
	let curY = 0;
	let velX = 0;
	let velY = 0;
	/* Orbital swirl, in degrees, plus its own decaying velocity. */
	let spin = 0;
	let spinVel = 0;

	let lastX = 0;
	let lastY = 0;
	let hasLast = false;

	let centreX = 0;
	let centreY = 0;
	let span = 1;
	let stale = true;

	let raf = 0;

	function measure() {
		const rect = node.getBoundingClientRect();
		/* The centre is stable under the node's own rotation; the box is not,
		   so the reach comes from the untransformed layout size. */
		centreX = rect.left + rect.width / 2;
		centreY = rect.top + rect.height / 2;
		span = Math.max(node.offsetWidth, node.offsetHeight) * reach;
		stale = false;
	}

	function frame() {
		raf = 0;

		const stiffness = 0.12;
		const damping = 0.76;
		velX = (velX + (targetX - curX) * stiffness) * damping;
		velY = (velY + (targetY - curY) * stiffness) * damping;
		curX += velX;
		curY += velY;

		/* The carry-through decays, and the offset it left behind unwinds
		   separately — so a flick reads as a push that runs on briefly, then
		   lets the orbits drift back to where their own animation would have
		   them. */
		spinVel *= 0.9;
		spin = clamp((spin + spinVel) * 0.94, -140, 140);

		node.style.setProperty('--tilt-ry', `${(curX * max).toFixed(3)}deg`);
		node.style.setProperty('--tilt-rx', `${(-curY * max).toFixed(3)}deg`);
		node.style.setProperty('--orbit-spin', `${spin.toFixed(3)}deg`);

		const settled =
			Math.abs(targetX - curX) < 0.001 &&
			Math.abs(targetY - curY) < 0.001 &&
			Math.abs(velX) < 0.0005 &&
			Math.abs(velY) < 0.0005 &&
			Math.abs(spinVel) < 0.002 &&
			Math.abs(spin) < 0.01;

		if (settled) {
			/* Land exactly on rest rather than leaving a sub-pixel residue in
			   the custom properties. */
			curX = targetX;
			curY = targetY;
			spin = 0;
			node.style.setProperty('--orbit-spin', '0deg');
		} else {
			raf = requestAnimationFrame(frame);
		}
	}

	function wake() {
		if (!raf) raf = requestAnimationFrame(frame);
	}

	function onMove(event: PointerEvent) {
		if (stale) measure();

		const dx = (event.clientX - centreX) / span;
		const dy = (event.clientY - centreY) / span;
		const dist = Math.hypot(dx, dy);
		/* Full strength anywhere inside the reach, tapering to nothing beyond
		   it so the portrait is not still craning at a cursor parked in the
		   footer. */
		const gate = dist <= 1 ? 1 : Math.max(0, 1 - (dist - 1) * 1.2);

		targetX = clamp(dx, -1, 1) * gate;
		targetY = clamp(dy, -1, 1) * gate;

		if (hasLast && gate > 0) {
			/* Angle swept around the centre between the last sample and this
			   one: cross gives the direction, dot the sign of the span. */
			const ax = lastX - centreX;
			const ay = lastY - centreY;
			const bx = event.clientX - centreX;
			const by = event.clientY - centreY;
			const cross = ax * by - ay * bx;
			const dot = ax * bx + ay * by;
			const swept = clamp((Math.atan2(cross, dot) * 180) / Math.PI, -14, 14) * gate * swirl;
			/* Most of the sweep lands on the offset directly, so the orbits
			   track the hand while it circles; the small share fed to the
			   velocity is what keeps them running for a moment after a flick.
			   Feeding it all to the velocity instead would integrate the whole
			   gesture and send them spinning several turns. */
			spin += swept;
			spinVel += swept * 0.09;
		}

		lastX = event.clientX;
		lastY = event.clientY;
		hasLast = true;
		wake();
	}

	function onLeaveWindow() {
		targetX = 0;
		targetY = 0;
		hasLast = false;
		wake();
	}

	function invalidate() {
		stale = true;
	}

	/* Tracking on the window rather than the node is the point: the portrait
	   answers the cursor as it crosses the whole hero, instead of only once it
	   is directly over the photo. */
	window.addEventListener('pointermove', onMove, { passive: true });
	window.addEventListener('pointerout', onLeaveWindow);
	window.addEventListener('blur', onLeaveWindow);
	window.addEventListener('resize', invalidate, { passive: true });
	window.addEventListener('scroll', invalidate, { passive: true });

	return {
		update(next: PointerOrbitOptions = {}) {
			max = next.max ?? 7;
			reach = next.reach ?? 2.4;
			swirl = next.swirl ?? 0.35;
			stale = true;
		},
		destroy() {
			if (raf) cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerout', onLeaveWindow);
			window.removeEventListener('blur', onLeaveWindow);
			window.removeEventListener('resize', invalidate);
			window.removeEventListener('scroll', invalidate);
		}
	};
};
