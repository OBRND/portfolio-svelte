<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicInOut, quintOut } from 'svelte/easing';
	import Mark from '$lib/components/Mark.svelte';
	import Shot from '$lib/components/Shot.svelte';
	import Desk from '$lib/components/Desk.svelte';
	import { mood } from '$lib/stores/stage';
	import { reducedMotion } from '$lib/stores/motion';
	import { progress, addSnap, docTop, refresh } from '$lib/motion/scroll';

	export interface Project {
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
		category: string;
	}

	interface Props {
		projects?: Project[];
		projectsError?: string | null;
	}

	let { projects = [], projectsError = null }: Props = $props();

	// Client-side recovery when the server load failed.
	let clientProjects = $state<Project[] | null>(null);
	let retrying = $state(false);
	let retryError = $state<string | null>(null);

	const all = $derived(clientProjects ?? projects);
	const activeError = $derived(retryError ?? (clientProjects ? null : projectsError));
	const mobile = $derived(all.filter((p) => p.category !== 'web'));
	const web = $derived(all.filter((p) => p.category === 'web'));

	async function retry() {
		retrying = true;
		retryError = null;
		try {
			const response = await fetch('/api/projects');
			if (!response.ok) throw new Error(`Request failed (${response.status})`);
			clientProjects = await response.json();
			refresh();
		} catch (err) {
			retryError = err instanceof Error ? err.message : 'Could not reach the server.';
		} finally {
			retrying = false;
		}
	}

	/**
	 * One pinned scene in three acts, all scrubbed from the section's scroll
	 * progress:
	 *
	 *   1. A closed laptop with a phone lying on the table beside it.
	 *   2. The phone rises to face you, on the left with its details to the
	 *      right, and becomes the stage for the mobile work. The handset never
	 *      changes — only what is on its screen. The
	 *      projects advance on their own and can be stepped through by hand;
	 *      scrolling is never spent paging through them, it just moves on.
	 *   3. The phone goes back down, the laptop opens and the camera pushes
	 *      into its display until the display is the page, which is where the
	 *      web work is shown.
	 *
	 * Both devices are built at their finished size and scaled *down* to sit
	 * in the scene, so arriving at a device is the scale returning to 1 —
	 * nothing is enlarged, and the type on the laptop's display is laid out at
	 * its real size from the start.
	 *
	 * On an upright screen a laptop display cannot be the viewport, so there
	 * the camera stops with the laptop in frame and the details sit under it.
	 *
	 * On a wide screen the table is laid out with the laptop right of centre
	 * and the phone to its left, so the phone has only a short way to travel
	 * to where it stands. `side` carries that handedness: it flips every
	 * sideways offset and every turn about a vertical or depth axis.
	 */

	/*
		The phone act is deliberately short. Its projects page themselves, so
		the scroll has nothing to do while the phone is up except leave — and
		leaving used to take most of a screen before the handset even began to
		go back down. Now it starts down a short scroll after it settles.
	*/
	const T = {
		rise: [0.04, 0.2],
		fall: [0.3, 0.42],
		open: [0.39, 0.6],
		zoom: [0.52, 0.89],
		/** Where the phone act rests, for the anchor and the snap point. */
		phoneRest: 0.27
	} as const;

	const DWELL_MS = 5200;

	let track = $state<HTMLElement | null>(null);
	let stage = $state<HTMLElement | null>(null);
	let rig = $state<HTMLElement | null>(null);
	let deskRig = $state<HTMLElement | null>(null);
	let lid = $state<HTMLElement | null>(null);
	let phoneRig = $state<HTMLElement | null>(null);
	let phoneEl = $state<HTMLElement | null>(null);

	let compact = $state(false);

	let mi = $state(0);
	let wi = $state(0);
	let mdir = $state(1);
	let wdir = $state(1);
	let mobileMore = $state(false);
	let webMore = $state(false);
	/**
	 * How many of the readable parts — a details panel, the handset, the
	 * browser window — the pointer or focus is on. Autoplay holds while it is
	 * not zero, so a project never changes under someone reading about it.
	 * (Hovering the scene as a whole cannot be the test: it fills the screen.)
	 */
	let holds = $state(0);
	const engaged = $derived(holds > 0);

	function hold(node: HTMLElement) {
		let over = false;
		let focused = false;
		const sync = (nextOver: boolean, nextFocused: boolean) => {
			const before = over || focused;
			over = nextOver;
			focused = nextFocused;
			const after = over || focused;
			if (before !== after) holds += after ? 1 : -1;
		};
		const enter = () => sync(true, focused);
		const leave = () => sync(false, focused);
		// Keyboard focus only. A mouse click leaves focus on the button it
		// pressed, and counting that would hold the autoplay for good after
		// the first click on "next".
		const focusIn = (event: FocusEvent) => {
			if ((event.target as Element | null)?.matches?.(':focus-visible')) sync(over, true);
		};
		const focusOut = () => sync(over, false);
		node.addEventListener('pointerenter', enter);
		node.addEventListener('pointerleave', leave);
		node.addEventListener('focusin', focusIn);
		node.addEventListener('focusout', focusOut);
		return {
			destroy() {
				sync(false, false);
				node.removeEventListener('pointerenter', enter);
				node.removeEventListener('pointerleave', leave);
				node.removeEventListener('focusin', focusIn);
				node.removeEventListener('focusout', focusOut);
			}
		};
	}

	/** The pinned scene is actually on screen (not scrolled past with p stuck at 1). */
	let onStage = $state(false);
	let phoneUp = $state(false);
	let zoomedIn = $state(false);
	/** Each act counts as live only while it is the one on screen. */
	const phoneLive = $derived(phoneUp && onStage);
	const webLive = $derived(zoomedIn && onStage);
	/** Bumped on a manual change so the dwell bar restarts with it. */
	let beat = $state(0);

	const mproject = $derived(mobile[Math.min(mi, Math.max(mobile.length - 1, 0))]);
	const wproject = $derived(web[Math.min(wi, Math.max(web.length - 1, 0))]);
	const autoplaying = $derived(!engaged && !$reducedMotion && (phoneLive || webLive));

	function stepMobile(delta: number) {
		if (mobile.length < 2) return;
		mdir = delta >= 0 ? 1 : -1;
		mi = (mi + delta + mobile.length) % mobile.length;
		mobileMore = false;
		beat++;
	}

	function stepWeb(delta: number) {
		if (web.length < 2) return;
		wdir = delta >= 0 ? 1 : -1;
		wi = (wi + delta + web.length) % web.length;
		webMore = false;
		beat++;
	}

	function pickMobile(index: number) {
		if (index !== mi) stepMobile(index - mi);
	}

	function pickWeb(index: number) {
		if (index !== wi) stepWeb(index - wi);
	}

	// The projects advance on their own while their act is on stage.
	$effect(() => {
		if (!autoplaying) return;
		beat;
		const live = phoneLive ? 'mobile' : 'web';
		const timer = setTimeout(() => (live === 'mobile' ? stepMobile(1) : stepWeb(1)), DWELL_MS);
		return () => clearTimeout(timer);
	});

	// Fetch the neighbours of whatever is showing, so the next change wipes
	// onto a finished image rather than an empty screen.
	$effect(() => {
		if (!onStage) return;
		const next = [mobile[(mi + 1) % Math.max(mobile.length, 1)], web[(wi + 1) % Math.max(web.length, 1)]];
		for (const project of next) {
			if (project?.screenshot) new Image().src = project.screenshot;
		}
	});

	// Inside the display there is no sky to light; say so, so it stops drawing.
	$effect(() => {
		if (compact) return;
		if (webLive) mood.set('screen');
		else if (phoneLive) mood.set('dusk');
	});

	/* ---- Screen transitions ------------------------------------------------ */

	/** The incoming screenshot is wiped on in the direction of travel. */
	function shotIn(_node: Element, { dir }: { dir: number }) {
		return {
			duration: $reducedMotion ? 0 : 900,
			easing: cubicInOut,
			css: (t: number, u: number) => `
				clip-path: inset(${dir > 0 ? u * 100 : 0}% 0 ${dir > 0 ? 0 : u * 100}% 0);
				transform: scale(${1 + u * 0.18});
				z-index: 2;
			`
		};
	}

	/** The outgoing one sinks back and dims underneath it. */
	function shotOut(_node: Element, { dir }: { dir: number }) {
		return {
			duration: $reducedMotion ? 0 : 900,
			easing: cubicInOut,
			css: (t: number, u: number) => `
				transform: translate3d(0, ${dir * u * -9}%, 0) scale(${1 - u * 0.08});
				filter: brightness(${1 - u * 0.65});
			`
		};
	}

	function textIn(_node: Element, { dir }: { dir: number }) {
		return {
			duration: $reducedMotion ? 0 : 800,
			delay: $reducedMotion ? 0 : 160,
			easing: quintOut,
			css: (t: number, u: number) => `transform: translate3d(0, ${dir * u * 36}px, 0); opacity: ${t};`
		};
	}

	function textOut(_node: Element, { dir }: { dir: number }) {
		return {
			duration: $reducedMotion ? 0 : 300,
			css: (t: number, u: number) => `transform: translate3d(0, ${dir * u * -24}px, 0); opacity: ${t};`
		};
	}

	/* ---- Swipe on the handset ---------------------------------------------- */

	let swipeX = 0;
	let swipeY = 0;
	let swiping = false;

	function onPhoneDown(event: PointerEvent) {
		swiping = true;
		swipeX = event.clientX;
		swipeY = event.clientY;
	}

	function onPhoneUp(event: PointerEvent) {
		if (!swiping) return;
		swiping = false;
		const dx = event.clientX - swipeX;
		const dy = event.clientY - swipeY;
		if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) * 1.2) stepMobile(dx < 0 ? 1 : -1);
		else if (Math.abs(dx) < 6 && Math.abs(dy) < 6) stepMobile(1);
	}

	/* ---- The camera --------------------------------------------------------- */

	const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);
	const seg = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
	const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
	const mix = (a: number, b: number, t: number) => a + (b - a) * t;

	let phoneHeight = 0;
	/*
		The stage's own box, not the window's. On a phone `innerHeight` changes
		every time the browser's toolbar slides in or out, which is mid-scroll,
		and every offset below is a fraction of it — so the devices used to hop.
		The stage is `100vh`, which holds still.
	*/
	let stageW = 0;
	let stageH = 0;
	/** Scenes that are fully faded out are taken off the compositor entirely. */
	let laptopOff = false;
	let phoneOff = false;
	let deskOff = false;

	function update(p: number) {
		if (!rig || !phoneRig || !track || !stageW) return;
		const w = stageW;
		const h = stageH;
		const reduced = $reducedMotion;

		// Reduced motion keeps the three acts but cuts between them.
		const rise = reduced ? 1 : ease(seg(p, T.rise));
		const fall = reduced ? (p < 0.5 ? 0 : 1) : ease(seg(p, T.fall));
		const open = reduced ? (p < 0.5 ? 0 : 1) : ease(seg(p, T.open));
		const zoom = reduced ? (p < 0.5 ? 0 : 1) : ease(seg(p, T.zoom));
		const up = rise * (1 - fall);
		const out = 1 - zoom;

		/* Laptop. */
		const displayH = compact ? w * 0.55 : h;
		const scale0 = compact ? 0.48 : 0.4;
		// Geometric, not linear: a zoom that covers equal ratios in equal
		// scroll reads as constant speed; a linear one crawls then lunges.
		const scale = Math.pow(scale0, out);
		// -1 on a wide screen (phone to the left of the laptop), 1 upright.
		const side = compact ? 1 : -1;
		const rx = mix(-27, -13, open) * out;
		const ry = mix(-34, -20, open) * out * side;
		// Sits off-centre while the phone shares the table with it.
		const homeX = (compact ? 0.16 : 0.1) * w * (1 - open);
		// A closed laptop sits below the lid's own centre; lift it into frame.
		const homeY = mix(-0.25, -0.07, open) * out * displayH + (compact ? mix(-0.06, -0.2, zoom) * h : 0);
		// While the phone has the stage, the laptop backs off into the dark.
		const lapX = homeX - side * up * 0.1 * w;
		const lapY = homeY + up * 0.06 * h;
		const lapScale = scale * (1 - up * 0.22);

		rig.style.transform = `translate3d(${lapX.toFixed(1)}px, ${lapY.toFixed(1)}px, 0) scale3d(${lapScale.toFixed(4)}, ${lapScale.toFixed(4)}, ${lapScale.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
		if (lid) lid.style.transform = `rotateX(${mix(-84, 9 * out, open).toFixed(2)}deg)`;
		if (deskRig) deskRig.style.transform = `translate3d(${homeX.toFixed(1)}px, ${homeY.toFixed(1)}px, 0) scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, ${scale.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

		/* Phone: lying on the laptop's table, or standing to face you. */
		const k = scale / scale0;
		const lapWidth = (compact ? 0.88 : 1) * w * scale0;
		const sTable = phoneHeight > 0 ? (lapWidth * 0.46) / phoneHeight : 0.4;
		// Position the resting phone on the same physical plane as the desk.
		// Rotate its centre with the board before interpolating toward the reader.
		const unit = w * (compact ? 0.0088 : 0.01);
		const bezel = compact ? unit * 1.8 : Math.max(10, unit * 1.3);
		const lidH = displayH + bezel * 2;
		const ax = rx * Math.PI / 180;
		const ay = ry * Math.PI / 180;
		const deskX = (compact ? 0.65 : -0.94) * (compact ? w * 0.88 : w);
		const deskZ = lidH * 0.68;
		const phoneDepth = phoneHeight * 0.4615 * 0.0765 * sTable / scale0;
		const deskY = lidH / 2 + unit * 1.5 + 3 - phoneDepth;
		const turnedZ = -Math.sin(ay) * deskX + Math.cos(ay) * deskZ;
		const table = {
			x: homeX + (Math.cos(ay) * deskX + Math.sin(ay) * deskZ) * scale,
			y: homeY + (Math.cos(ax) * deskY - Math.sin(ax) * turnedZ) * scale,
			z: (Math.sin(ax) * deskY + Math.cos(ax) * turnedZ) * scale,
			s: sTable * k,
			rx,
			ry,
			lay: 90,
			yaw: compact ? 24 : -16
		};
		const show = {
			x: compact ? 0 : -0.17 * w,
			y: compact ? -0.2 * h : 0.02 * h,
			s: 1,
			rx: 0,
			ry: compact ? 0 : -14,
			lay: 0,
			yaw: 0
		};
		// It lifts in an arc rather than sliding straight across.
		const arc = Math.sin(up * Math.PI) * 0.07 * h;
		const px = mix(table.x, show.x, up);
		const py = mix(table.y, show.y, up) - arc;
		const ps = mix(table.s, show.s, up);
		phoneRig.style.transform =
			`translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, ${(table.z * (1 - up)).toFixed(1)}px) scale3d(${ps.toFixed(4)}, ${ps.toFixed(4)}, ${ps.toFixed(4)}) ` +
			`rotateX(${mix(table.rx, show.rx, up).toFixed(2)}deg) rotateY(${mix(table.ry, show.ry, up).toFixed(2)}deg) ` +
			`rotateX(${mix(table.lay, show.lay, up).toFixed(2)}deg) rotateZ(${mix(table.yaw, show.yaw, up).toFixed(2)}deg)`;

		// Everything that is not a transform hangs off these numbers in CSS.
		const style = track.style;
		style.setProperty('--up', up.toFixed(4));
		style.setProperty('--open', open.toFixed(4));
		style.setProperty('--zoom', zoom.toFixed(4));

		const nextPhoneUp = up > 0.86;
		const nextZoomedIn = zoom > 0.985;
		if (nextPhoneUp !== phoneUp) phoneUp = nextPhoneUp;
		if (nextZoomedIn !== zoomedIn) zoomedIn = nextZoomedIn;

		// Matches the two opacity curves in the stylesheet: past these points
		// a scene is at zero, and a 3D scene at zero opacity still costs its
		// full set of layers unless it is actually hidden.
		const nextLaptopOff = up > 0.875;
		const nextPhoneOff = zoom > 0.46;
		const nextDeskOff = zoom >= 1 / 2.6 || (compact && up === 1);
		if (nextLaptopOff !== laptopOff) {
			laptopOff = nextLaptopOff;
			if (rig.parentElement) rig.parentElement.style.visibility = laptopOff ? 'hidden' : '';
		}
		if (nextPhoneOff !== phoneOff) {
			phoneOff = nextPhoneOff;
			if (phoneRig.parentElement) phoneRig.parentElement.style.visibility = phoneOff ? 'hidden' : '';
		}
		if (nextDeskOff !== deskOff) {
			deskOff = nextDeskOff;
			if (deskRig?.parentElement) deskRig.parentElement.style.visibility = deskOff ? 'hidden' : '';
		}
	}

	function reapply() {
		phoneHeight = phoneEl?.offsetHeight ?? 0;
		stageW = stage?.offsetWidth ?? window.innerWidth;
		stageH = stage?.offsetHeight ?? window.innerHeight;
		if (track) update(parseFloat(track.style.getPropertyValue('--p')) || 0);
	}

	onMount(() => {
		const narrow = window.matchMedia('(max-aspect-ratio: 1/1), (max-width: 820px)');
		const applyLayout = () => {
			compact = narrow.matches;
			requestAnimationFrame(reapply);
		};
		applyLayout();
		narrow.addEventListener('change', applyLayout);
		window.addEventListener('resize', reapply);

		const watch = new IntersectionObserver(([entry]) => (onStage = entry.intersectionRatio > 0.7), {
			threshold: [0, 0.7, 1]
		});
		if (stage) watch.observe(stage);

		const stopSnap = addSnap(() => {
			if (!track) return [];
			const top = docTop(track);
			const travel = track.offsetHeight - (stageH || window.innerHeight);
			return [top + travel * T.phoneRest, top + travel];
		});

		return () => {
			narrow.removeEventListener('change', applyLayout);
			window.removeEventListener('resize', reapply);
			watch.disconnect();
			stopSnap();
		};
	});

	// The rigs only exist once there is something to show.
	$effect(() => {
		all.length;
		rig;
		phoneRig;
		requestAnimationFrame(reapply);
	});

	const pad = (n: number) => String(n).padStart(2, '0');

	function linkLabel(link: string) {
		try {
			const url = new URL(link);
			return (url.host + url.pathname).replace(/^www\./, '').replace(/\/$/, '');
		} catch {
			return '';
		}
	}
</script>

<!-- Name, one line, the write-up, and what it is made of. Shared by all three panels. -->
{#snippet info(project: Project, more: boolean, toggle: () => void)}
	<h3 class="p-name">{project.name}</h3>
	{#if project.subtitle}<p class="p-sub u-serif">{project.subtitle}</p>{/if}

	<p class="p-desc" class:more>{project.description}</p>
	{#if project.description.length > 240}
		<button type="button" class="p-more u-label" onclick={toggle}>{more ? 'Less' : 'Read more'}</button>
	{/if}

	<dl class="p-spec">
		{#if project.technologies.length}
			<div>
				<dt class="u-label">Stack</dt>
				<dd>{project.technologies.join(' · ')}</dd>
			</div>
		{/if}
		{#if project.tags.length}
			<div>
				<dt class="u-label">Scope</dt>
				<dd>{project.tags.join(' · ')}</dd>
			</div>
		{/if}
		<div>
			<dt class="u-label">Year</dt>
			<dd>{project.year}</dd>
		</div>
	</dl>
{/snippet}

{#snippet controls(count: number, index: number, step: (delta: number) => void, pick: (index: number) => void, live: boolean, link: string)}
	<div class="p-controls">
		{#if count > 1}
			<div class="p-arrows">
				<button type="button" class="arrow" onclick={() => step(-1)} aria-label="Previous project">
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
				</button>
				<button type="button" class="arrow next" onclick={() => step(1)} aria-label="Next project">
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
				</button>
			</div>

			<div class="p-dots">
				{#each { length: count } as _, i}
					<button
						type="button"
						class="dot"
						class:active={i === index}
						aria-label="Project {i + 1} of {count}"
						aria-current={i === index ? 'true' : undefined}
						onclick={() => pick(i)}
					>
						{#if i === index}
							{#key beat}
								<i class:running={live && autoplaying} style="animation-duration: {DWELL_MS}ms"></i>
							{/key}
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if link && link !== '#'}
			<a class="p-link u-label" href={link} target="_blank" rel="noopener noreferrer">Source ↗</a>
		{/if}
	</div>
{/snippet}

{#if all.length === 0}
	<section class="state" id="projects" data-section="projects" data-mood="dusk">
		<span class="u-label">04 — Work</span>
		{#if activeError}
			<p class="state-line">The work is <span class="u-serif">there</span>, the connection wasn't.</p>
			<p class="state-detail">{activeError}</p>
			<button type="button" class="u-btn solid" onclick={retry} disabled={retrying}>
				{retrying ? 'Retrying…' : 'Try again'}
			</button>
		{:else}
			<p class="state-line">Case studies are <span class="u-serif">on their way</span>.</p>
		{/if}
	</section>
{:else}
	<section
		class="showcase"
		class:compact
		class:phone-live={phoneLive}
		class:web-live={webLive}
		bind:this={track}
		use:progress={{ onUpdate: update }}
		data-section="projects"
		data-mood="dusk"
	>
		<!-- Menu links land on the phone, not on a closed lid. -->
		<span id="projects" class="anchor" aria-hidden="true"></span>

		<div class="stage" bind:this={stage}>
			<div class="scene desk-scene" aria-hidden="true">
				<div class="rig" bind:this={deskRig}><Desk /></div>
			</div>

			<div class="caption" aria-hidden="true">
				<span class="u-label">04 — Work</span>
				<p class="caption-line">Selected <span class="u-serif">work</span></p>
			</div>

			<!-- ---- Laptop ---------------------------------------------------- -->
			<div class="scene laptop-scene">
				<div class="rig" bind:this={rig}>
					<div class="laptop">
						<div class="lid" bind:this={lid}>
							<div class="lid-front">
								<span class="camera" aria-hidden="true"></span>

								<div class="display">
									<div class="wall">
										<div class="wall-glow" aria-hidden="true"></div>

										{#if web.length === 0}
											<div class="wall-empty">
												<span class="u-label">Web</span>
												<p class="state-line">Web case studies are <span class="u-serif">on their way</span>.</p>
											</div>
										{:else if compact}
											<!-- On an upright screen the display is just the site itself. -->
											{#key wproject.id}
												<div class="shot-layer" in:shotIn={{ dir: wdir }} out:shotOut={{ dir: wdir }}>
													<Shot src={wproject.screenshot} fallbackSrc={wproject.screenshotFallback} label={wproject.name} loading="eager" />
												</div>
											{/key}
										{:else}
											<!--
												The web work, shown the way a site is used: each
												project is a tab, the site sits in a browser
												window that reads down its own page, and the
												details are set beside it like a page's own
												meta table.
											-->
											<div class="web" inert={!webLive}>
												<div class="tabs" role="tablist" aria-label="Web projects" use:hold>
													<span class="tabs-cap u-label">Web</span>
													{#each web as project, i (project.id)}
														<button
															type="button"
															role="tab"
															class="tab"
															class:active={i === wi}
															aria-selected={i === wi}
															onclick={() => pickWeb(i)}
														>
															<span class="tab-n">{pad(i + 1)}</span>
															<span class="tab-t">{project.name}</span>
														</button>
													{/each}
												</div>

												<div class="web-body">
													<div class="web-info" use:hold>
														{#key wproject.id}
															<div class="swap" in:textIn={{ dir: wdir }} out:textOut={{ dir: wdir }}>
																{@render info(wproject, webMore, () => (webMore = !webMore))}
															</div>
														{/key}
														{@render controls(web.length, wi, stepWeb, pickWeb, webLive, wproject.detailsLink)}
													</div>

													<div class="window" use:hold>
														<div class="window-bar">
															<span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
															<span class="address">{linkLabel(wproject.detailsLink) || wproject.name}</span>
														</div>
														<div class="window-view">
															{#key wproject.id}
																<div class="shot-layer" in:shotIn={{ dir: wdir }} out:shotOut={{ dir: wdir }}>
																	<Shot src={wproject.screenshot} fallbackSrc={wproject.screenshotFallback} label={wproject.name} loading="eager" pan />
																</div>
																<!-- The page "loading" as you switch tabs. -->
																<span class="loadbar" aria-hidden="true"></span>
															{/key}
														</div>
													</div>
												</div>
											</div>
										{/if}
									</div>
									<div class="glare" aria-hidden="true"></div>
								</div>
							</div>

							<div class="lid-back" aria-hidden="true">
								<Mark size="100%" class="lid-mark" />
							</div>
							<span class="edge lid-top" aria-hidden="true"></span>
							<span class="edge lid-left" aria-hidden="true"></span>
							<span class="edge lid-right" aria-hidden="true"></span>
						</div>

						<div class="base" aria-hidden="true">
							<div class="base-bottom"></div>
							<div class="deck">
								<div class="keys"></div>
								<div class="trackpad"></div>
								<div class="notch"></div>
							</div>
							<span class="edge base-front"></span>
							<span class="edge base-left"></span>
							<span class="edge base-right"></span>
						</div>
					</div>
				</div>
			</div>

			<!-- ---- Phone ----------------------------------------------------- -->
			<div class="scene phone-scene">
				<div class="rig phone-rig" bind:this={phoneRig}>
					<div class="phone" bind:this={phoneEl}>
						{#each { length: 9 } as _, i}
							<span class="slab" class:back={i === 8} style="--z: {i + 1}" aria-hidden="true"></span>
						{/each}

						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="phone-face"
							use:hold
							data-cursor={phoneLive && mobile.length > 1 ? 'Next' : null}
							onpointerdown={onPhoneDown}
							onpointerup={onPhoneUp}
							onpointercancel={() => (swiping = false)}
						>
							<div class="phone-screen">
								{#if mproject}
									{#key mproject.id}
										<div class="shot-layer" in:shotIn={{ dir: mdir }} out:shotOut={{ dir: mdir }}>
											<Shot src={mproject.screenshot} fallbackSrc={mproject.screenshotFallback} label={mproject.name} loading="eager" />
										</div>
										<!-- A band of light crosses the glass with each change. -->
										<span class="sweep" aria-hidden="true"></span>
									{/key}
								{:else}
									<div class="shot-layer"><Shot label="Mobile work, soon" /></div>
								{/if}
								<span class="glare" aria-hidden="true"></span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- ---- Mobile details -------------------------------------------- -->
			{#if mproject}
				<div class="panel mobile-panel theme-flutter" inert={!phoneLive} use:hold>
					<p class="panel-cap u-label">
						<span class="cap-kind">Mobile</span>
						<span>{pad(mi + 1)} / {pad(mobile.length)}</span>
					</p>
					<div class="swap-wrap">
						{#key mproject.id}
							<div class="swap" in:textIn={{ dir: mdir }} out:textOut={{ dir: mdir }}>
								{@render info(mproject, mobileMore, () => (mobileMore = !mobileMore))}
							</div>
						{/key}
					</div>
					{@render controls(mobile.length, mi, stepMobile, pickMobile, phoneLive, mproject.detailsLink)}
				</div>
			{/if}

			<!-- ---- Web details, where the display is too small to hold them --- -->
			{#if compact && wproject}
				<div class="panel web-panel theme-svelte" inert={!webLive} use:hold>
					<p class="panel-cap u-label">
						<span class="cap-kind">Web</span>
						<span>{pad(wi + 1)} / {pad(web.length)}</span>
					</p>
					<div class="swap-wrap">
						{#key wproject.id}
							<div class="swap" in:textIn={{ dir: wdir }} out:textOut={{ dir: wdir }}>
								{@render info(wproject, webMore, () => (webMore = !webMore))}
							</div>
						{/key}
					</div>
					{@render controls(web.length, wi, stepWeb, pickWeb, webLive, wproject.detailsLink)}
				</div>
			{/if}
		</div>

		<!-- The way back out of the screen: its ground thins into the sky again. -->
		<div class="tail" aria-hidden="true"></div>
	</section>
{/if}

<style>
	.showcase {
		--p: 0;
		--up: 0;
		--open: 0;
		--zoom: 0;
		/* The laptop's display is exactly one viewport. Everything about the
		   device is measured in `--u`, one percent of that width, so the whole
		   object scales with the window and never needs remeasuring. */
		--W: 100vw;
		--H: 100vh;
		--u: 1vw;
		--bezel: max(10px, calc(var(--u) * 1.3));
		/* The phone's screen, at the size it is shown at. */
		--ph: min(70vh, 44rem);
		--pw: calc(var(--ph) * 0.4615);
		--alu-1: #d7d9de;
		--alu-2: #a9acb4;
		--alu-3: #7d8089;
		--alu-edge: #5d6068;
		--device-glass: #080a0d;
		--device-rim: #727680;
		--device-sheen: linear-gradient(105deg, #ffffff66, transparent 38%, #00000024);
		position: relative;
		height: 620vh;
	}

	.showcase.compact {
		--W: 88vw;
		--H: 55vw;
		--u: 0.88vw;
		--bezel: calc(var(--u) * 1.8);
		--ph: min(42svh, 25rem);
	}

	.anchor {
		position: absolute;
		left: 0;
		/* T.phoneRest */
		top: calc((100% - 100vh) * 0.27);
	}

	.stage {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow: hidden;
	}

	.scene {
		position: absolute;
		inset: 0;
		perspective: 260vmax;
		perspective-origin: 50% 50%;
		pointer-events: none;
	}

	/* Opacity lives on the scene, not the rig: on a `preserve-3d` element it
	   would flatten the device into a card. */
	.laptop-scene {
		z-index: 1;
		opacity: calc(1 - var(--up) * 1.15);
	}

	.phone-scene {
		z-index: 2;
		opacity: clamp(0, calc(1 - (var(--zoom) - 0.12) * 3), 1);
	}

	.rig {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
		transform-origin: 50% 50%;
		will-change: transform;
	}

	/* The desk follows the camera and recedes while project details are read. */
	.desk-scene {
		opacity: calc(clamp(0, 1 - var(--zoom) * 2.6, 1) * (1 - var(--up) * 0.78));
	}

	.compact .desk-scene {
		opacity: calc(clamp(0, 1 - var(--zoom) * 2.6, 1) * (1 - var(--up)));
	}

	/* ---- Caption ---------------------------------------------------------- */

	.caption {
		position: absolute;
		inset: calc(var(--header-h) + 1rem) var(--gutter) auto;
		z-index: 3;
		display: grid;
		gap: var(--sp-4);
		opacity: clamp(0, calc(1 - var(--p) * 11), 1);
		transform: translate3d(0, calc(var(--p) * -160px), 0);
		pointer-events: none;
	}

	.caption-line {
		font-family: var(--font-display);
		font-size: clamp(3rem, 9vw, 9.5rem);
		font-weight: 300;
		font-stretch: 78%;
		line-height: 0.86;
		letter-spacing: var(--tracking-display);
	}

	.caption-line .u-serif {
		font-size: 1.06em;
		color: var(--ember);
	}

	/* ---- Display ---------------------------------------------------------- */

	.display {
		position: absolute;
		left: var(--bezel);
		top: var(--bezel);
		width: var(--W);
		height: var(--H);
		overflow: hidden;
		background: #000;
		/* The glass has corners; the page does not. */
		border-radius: calc(var(--u) * 0.7 * (1 - var(--zoom)));
	}

	.compact .display {
		border-radius: calc(var(--u) * 0.8);
	}

	.wall {
		position: absolute;
		inset: 0;
		background: var(--panel);
		color: var(--text);
		/* The display wakes as the lid lifts. */
		opacity: clamp(0, calc((var(--open) - 0.2) * 2.6), 1);
	}

	.wall-glow {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(60% 55% at 8% 4%, color-mix(in srgb, var(--azure) 26%, transparent), transparent 70%),
			radial-gradient(60% 60% at 96% 100%, color-mix(in srgb, var(--ember) 30%, transparent), transparent 70%);
	}

	.wall-empty {
		position: absolute;
		inset: 0;
		display: grid;
		align-content: center;
		gap: var(--sp-4);
		padding: var(--gutter);
	}

	.glare {
		position: absolute;
		inset: 0;
		z-index: 4;
		background: linear-gradient(118deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 32%, transparent 46%);
		opacity: calc(1 - var(--zoom) * 1.6);
		pointer-events: none;
	}

	.shot-layer {
		position: absolute;
		inset: 0;
		will-change: transform, clip-path;
	}

	/* ---- Web showcase (inside the display) -------------------------------- */

	.web {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: clamp(1rem, 2.4vh, 2rem);
		padding: calc(var(--header-h) + 0.25rem) var(--gutter) clamp(1.25rem, 3vh, 2.25rem);
		pointer-events: none;
	}

	.web-live .web {
		pointer-events: auto;
	}

	/* Leave the section rail its margin instead of running under it. */
	@media (min-width: 1100px) and (min-height: 620px) {
		.web {
			padding-right: calc(var(--gutter) + 4.5rem);
		}
	}

	.tabs {
		display: flex;
		align-items: stretch;
		gap: 0.25rem;
		border-bottom: 1px solid var(--line-strong);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tabs::-webkit-scrollbar {
		display: none;
	}

	.tabs-cap {
		align-self: center;
		margin-right: var(--sp-5);
		color: var(--ember);
	}

	.tab {
		display: inline-flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.75rem 1.1rem 0.7rem;
		border-radius: var(--r-sm) var(--r-sm) 0 0;
		color: var(--text-muted);
		white-space: nowrap;
		transition:
			background-color var(--dur-base) var(--ease-out),
			color var(--dur-base) var(--ease-out);
	}

	.tab:hover {
		color: var(--text);
		background: var(--line-hairline);
	}

	.tab.active {
		background: var(--text);
		color: var(--bg);
	}

	.tab-n {
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		letter-spacing: 0.1em;
		opacity: 0.6;
	}

	.tab-t {
		font-size: var(--fs-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.web-body {
		display: grid;
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		gap: clamp(2rem, 4.5vw, 6rem);
		align-items: center;
		min-height: 0;
	}

	.web-info {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		gap: var(--sp-5);
		max-height: 100%;
		min-height: 0;
	}

	.web-info .swap {
		grid-area: 1 / 1;
		min-height: 0;
		overflow-y: auto;
		scrollbar-width: none;
	}

	.web-info .swap::-webkit-scrollbar {
		display: none;
	}

	.web-info :global(.p-controls) {
		grid-row: 2;
	}

	/* A browser window: a bar, an address, and the page reading down itself. */
	.window {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		width: 100%;
		max-height: 100%;
		aspect-ratio: 16 / 10.6;
		justify-self: end;
		border-radius: var(--r-md);
		border: 1px solid var(--line-strong);
		background: var(--bg-elev-1);
		box-shadow: var(--shadow-xl);
		overflow: hidden;
	}

	.window-bar {
		display: grid;
		grid-template-columns: 1fr minmax(0, 3fr) 1fr;
		align-items: center;
		gap: var(--sp-4);
		padding: 0.6rem 0.9rem;
		border-bottom: 1px solid var(--line);
	}

	.lights {
		display: flex;
		gap: 0.4rem;
	}

	.lights i {
		width: 0.62rem;
		height: 0.62rem;
		border-radius: 50%;
		background: var(--line-strong);
	}

	.address {
		padding: 0.3rem 0.9rem;
		border-radius: var(--r-pill);
		background: var(--line-hairline);
		font-family: var(--font-mono);
		font-size: var(--fs-eyebrow);
		letter-spacing: 0.04em;
		color: var(--text-muted);
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.window-view {
		position: relative;
		overflow: hidden;
		background: #0a0b0f;
	}

	.loadbar {
		position: absolute;
		inset: 0 0 auto;
		z-index: 3;
		height: 2px;
		background: linear-gradient(90deg, var(--azure), var(--ember));
		transform-origin: 0 50%;
		animation: load 900ms var(--ease-in-out) both;
	}

	@keyframes load {
		0% {
			transform: scaleX(0);
			opacity: 1;
		}
		80% {
			transform: scaleX(1);
			opacity: 1;
		}
		100% {
			transform: scaleX(1);
			opacity: 0;
		}
	}

	/* ---- Project details (shared) ----------------------------------------- */

	.p-name {
		font-size: clamp(2.6rem, 5.6vw, 6.2rem);
		font-size: clamp(2.6rem, min(5.6vw, 10.5vh), 6.2rem);
		font-weight: 300;
		font-stretch: 75%;
		line-height: 0.86;
		letter-spacing: -0.03em;
		overflow-wrap: anywhere;
	}

	.p-sub {
		margin-top: 0.7rem;
		font-size: clamp(1.3rem, 2vw, 1.8rem);
		line-height: 1.08;
		color: var(--accent-ink, var(--ember));
	}

	.p-desc {
		margin-top: var(--sp-4);
		max-width: 56ch;
		font-size: var(--fs-sm);
		line-height: 1.5;
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		overflow: hidden;
	}

	.p-desc.more {
		-webkit-line-clamp: unset;
		line-clamp: unset;
	}

	.p-more {
		margin-top: 0.5rem;
		padding-block: 0.25rem;
		color: var(--text);
		border-bottom: 1px solid var(--line-strong);
	}

	.p-spec {
		display: grid;
		margin-top: var(--sp-5);
		border-top: 1px solid var(--line);
	}

	.p-spec > div {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr);
		gap: var(--sp-4);
		padding-block: 0.6rem;
		border-bottom: 1px solid var(--line);
	}

	.p-spec dt {
		padding-top: 0.2rem;
	}

	.p-spec dd {
		font-size: var(--fs-sm);
		line-height: 1.35;
		letter-spacing: -0.01em;
	}

	.p-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-4) var(--sp-5);
	}

	.p-arrows {
		display: flex;
		gap: 0.5rem;
	}

	.arrow {
		display: grid;
		place-items: center;
		width: 3.25rem;
		height: 3.25rem;
		border-radius: 50%;
		border: 1px solid var(--line-strong);
		color: var(--text);
		transition:
			background-color var(--dur-base) var(--ease-out),
			color var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out);
	}

	.arrow.next {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg);
	}

	.arrow:hover {
		background: var(--ember);
		border-color: var(--ember);
		color: #07080c;
	}

	.p-dots {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	/* Each dot is a short rule; the current one is longer and fills as its
	   turn runs out. */
	.dot {
		position: relative;
		width: 1.1rem;
		height: 1.5rem;
		transition: width var(--dur-slow) var(--ease-out);
	}

	.dot::before,
	.dot i {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 2px;
		margin-top: -1px;
		border-radius: 2px;
	}

	.dot::before {
		background: var(--line-strong);
	}

	.dot.active {
		width: 2.6rem;
	}

	.dot i {
		background: var(--text);
		transform-origin: 0 50%;
	}

	.dot i.running {
		background: var(--ember);
		animation: dwell linear both;
	}

	@keyframes dwell {
		from {
			transform: scaleX(0);
		}
	}

	.p-link {
		margin-left: auto;
		padding-block: 0.3rem;
		color: var(--text);
		text-decoration: none;
		border-bottom: 1px solid var(--line-strong);
		transition: border-color var(--dur-base) ease;
	}

	.p-link:hover {
		border-color: var(--ember);
	}

	/* ---- Panels (details set beside a device) ----------------------------- */

	.panel {
		position: absolute;
		z-index: 3;
		display: grid;
		gap: var(--sp-5);
		pointer-events: none;
	}

	.panel-cap {
		display: flex;
		gap: 1rem;
	}

	.cap-kind {
		color: var(--accent);
	}

	.swap-wrap {
		display: grid;
	}

	.swap-wrap .swap {
		grid-area: 1 / 1;
	}

	/* Right of the handset, and short of the section rail's margin. */
	.mobile-panel {
		--in: clamp(0, calc((var(--up) - 0.72) * 3.6), 1);
		left: calc(50% + 2vw);
		right: calc(var(--gutter) + 4.5rem);
		top: 50%;
		max-width: 36rem;
		opacity: var(--in);
		transform: translate3d(0, calc(-50% + (1 - var(--in)) * 36px), 0);
	}

	.phone-live .mobile-panel {
		pointer-events: auto;
	}

	.web-panel {
		--in: clamp(0, calc((var(--zoom) - 0.86) * 8), 1);
		left: var(--gutter);
		right: var(--gutter);
		bottom: clamp(1rem, 3svh, 2rem);
		opacity: var(--in);
		transform: translate3d(0, calc((1 - var(--in)) * 36px), 0);
	}

	.web-live .web-panel {
		pointer-events: auto;
	}

	/* ---- Laptop ----------------------------------------------------------- */

	.laptop {
		--lid-w: calc(var(--W) + var(--bezel) * 2);
		--lid-h: calc(var(--H) + var(--bezel) * 2);
		--lid-t: calc(var(--u) * 0.55);
		--thick: calc(var(--u) * 1.5);
		--corner: calc(var(--u) * 1.1);
		position: absolute;
		left: calc(50% - var(--lid-w) / 2);
		top: calc(50% - var(--lid-h) / 2);
		width: var(--lid-w);
		height: var(--lid-h);
		transform-style: preserve-3d;
	}

	/* Hinged along its bottom edge. 0° is upright and square to the camera,
	   which is the pose it finishes in; negative folds it down onto the keys. */
	.lid {
		position: absolute;
		inset: 0;
		transform-origin: 50% 100%;
		transform: rotateX(-84deg);
		transform-style: preserve-3d;
		will-change: transform;
	}

	.lid-front,
	.lid-back {
		position: absolute;
		inset: 0;
		border-radius: var(--corner);
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}

	.lid-front {
		background: var(--device-glass);
		box-shadow: inset 0 0 0 calc(var(--u) * 0.12) var(--device-rim);
	}

	.camera {
		position: absolute;
		left: 50%;
		top: calc(var(--bezel) * 0.5);
		width: calc(var(--u) * 0.36);
		height: calc(var(--u) * 0.36);
		margin: calc(var(--u) * -0.18) 0 0 calc(var(--u) * -0.18);
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #3a4a66, #0b0d12 70%);
	}

	.lid-back {
		display: grid;
		place-items: center;
		transform: rotateY(180deg) translateZ(var(--lid-t));
		background:
			var(--device-sheen),
			linear-gradient(180deg, var(--alu-1), var(--alu-2));
		box-shadow: inset 0 0 0 calc(var(--u) * 0.12) rgba(255, 255, 255, 0.35);
		/* Opaque on purpose. The mark is three strokes that cross, and a
		   translucent colour is laid down once per stroke, so every crossing
		   and joint came out as a darker spot. */
		color: #71747c;
	}

	.lid-back :global(.lid-mark) {
		width: 15%;
		height: auto;
		/* Drawn to read upright from the front while the lid is closed. */
		transform: rotate(180deg);
	}

	/*
		The walls that give the lid and the base their thickness. Each runs the
		full length of its side, so two walls always meet at a corner — stopping
		them short of the rounded corners is what left a gap beside the machine.
	*/
	.edge {
		position: absolute;
		background: linear-gradient(180deg, var(--alu-3), var(--alu-edge));
	}

	.lid-top {
		left: 0;
		top: 0;
		width: 100%;
		height: var(--lid-t);
		transform-origin: 50% 0;
		transform: rotateX(-90deg);
	}

	.lid-left {
		left: 0;
		top: 0;
		width: var(--lid-t);
		height: 100%;
		transform-origin: 0 50%;
		transform: rotateY(90deg);
	}

	.lid-right {
		right: 0;
		top: 0;
		width: var(--lid-t);
		height: 100%;
		transform-origin: 100% 50%;
		transform: rotateY(-90deg);
	}

	/* The base hangs from the same hinge line and is laid flat toward the
	   camera, so its own front face is the top of the deck. */
	.base {
		position: absolute;
		left: 0;
		top: 100%;
		width: 100%;
		height: var(--lid-h);
		transform-origin: 50% 0;
		transform: rotateX(90deg);
		transform-style: preserve-3d;
	}

	.deck,
	.base-bottom {
		position: absolute;
		inset: 0;
		border-radius: calc(var(--u) * 0.4) calc(var(--u) * 0.4) var(--corner) var(--corner);
	}

	.deck {
		background:
			linear-gradient(100deg, rgba(255, 255, 255, 0.34), transparent 40%, rgba(0, 0, 0, 0.12) 100%),
			linear-gradient(180deg, var(--alu-2), var(--alu-1));
		box-shadow: inset 0 0 0 calc(var(--u) * 0.1) rgba(255, 255, 255, 0.3);
	}

	.base-bottom {
		transform: translateZ(calc(var(--thick) * -1));
		background: var(--alu-edge);
	}

	/* Keys as a pattern, not as eighty elements: dark caps with the well
	   showing through as the gaps between them. */
	.keys {
		--kw: calc((100% + var(--u) * 0.35) / 14);
		--kh: calc((100% + var(--u) * 0.35) / 6);
		position: absolute;
		left: 7%;
		right: 7%;
		top: 9%;
		height: 46%;
		border-radius: calc(var(--u) * 0.5);
		background-color: #15161b;
		background-image:
			repeating-linear-gradient(90deg, transparent 0 calc(var(--kw) - var(--u) * 0.35), #2b2d34 0 var(--kw)),
			repeating-linear-gradient(180deg, transparent 0 calc(var(--kh) - var(--u) * 0.35), #2b2d34 0 var(--kh));
		box-shadow:
			0 0 0 calc(var(--u) * 0.35) #2b2d34,
			inset 0 0 calc(var(--u) * 1.2) rgba(0, 0, 0, 0.5);
	}

	.trackpad {
		position: absolute;
		left: 31%;
		right: 31%;
		top: 61%;
		bottom: 7%;
		border-radius: calc(var(--u) * 0.6);
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.07), rgba(255, 255, 255, 0.12));
		box-shadow: inset 0 0 0 calc(var(--u) * 0.08) rgba(0, 0, 0, 0.18);
	}

	.notch {
		position: absolute;
		left: 43%;
		right: 43%;
		bottom: 0;
		height: 1.6%;
		border-radius: calc(var(--u) * 0.6) calc(var(--u) * 0.6) 0 0;
		background: rgba(0, 0, 0, 0.2);
	}

	.base-front {
		left: 0;
		top: 100%;
		width: 100%;
		height: var(--thick);
		transform-origin: 50% 0;
		transform: rotateX(-90deg);
		background: linear-gradient(180deg, var(--alu-2), var(--alu-edge));
	}

	.base-right {
		left: 100%;
		top: 0;
		width: var(--thick);
		height: 100%;
		transform-origin: 0 50%;
		transform: rotateY(90deg);
		background: linear-gradient(90deg, var(--alu-3), var(--alu-edge));
	}

	.base-left {
		right: 100%;
		top: 0;
		width: var(--thick);
		height: 100%;
		transform-origin: 100% 50%;
		transform: rotateY(-90deg);
		background: linear-gradient(270deg, var(--alu-3), var(--alu-edge));
	}

	/* ---- Phone ------------------------------------------------------------ */

	.phone {
		--pb: calc(var(--pw) * 0.034);
		--pr: calc(var(--pw) * 0.17);
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(var(--pw) + var(--pb) * 2);
		height: calc(var(--ph) + var(--pb) * 2);
		margin: calc((var(--ph) + var(--pb) * 2) / -2) 0 0 calc((var(--pw) + var(--pb) * 2) / -2);
		transform-style: preserve-3d;
	}

	/* The body is a stack of plates rather than four walls: the corners are
	   far too round for flat walls to meet at, and a stack keeps them round
	   from every angle. */
	.slab {
		position: absolute;
		inset: 0;
		border-radius: var(--pr);
		background: linear-gradient(135deg, var(--alu-1), var(--alu-2) 30%, var(--alu-edge) 55%, var(--alu-3) 80%, var(--alu-1));
		transform: translateZ(calc(var(--z) * var(--pw) * -0.0085));
	}

	.slab.back {
		background: var(--device-sheen), linear-gradient(180deg, var(--alu-1), var(--alu-2));
	}

	.phone-face {
		position: absolute;
		inset: 0;
		border-radius: var(--pr);
		background: var(--device-glass);
		box-shadow:
			inset 0 0 0 calc(var(--pw) * 0.006) var(--device-rim),
			0 0 0 calc(var(--pw) * 0.006) var(--alu-2);
		touch-action: pan-y;
		pointer-events: none;
	}

	.phone-live .phone-face {
		pointer-events: auto;
	}

	.phone-screen {
		position: absolute;
		inset: var(--pb);
		border-radius: calc(var(--pr) - var(--pb));
		overflow: hidden;
		background: #0a0b0f;
	}

	.phone-screen .glare {
		opacity: 1;
	}

	.sweep {
		position: absolute;
		inset: -20% 0;
		z-index: 3;
		background: linear-gradient(
			180deg,
			transparent 30%,
			rgba(255, 255, 255, 0.28) 48%,
			color-mix(in srgb, var(--azure) 45%, transparent) 52%,
			transparent 70%
		);
		animation: sweep 900ms var(--ease-in-out) both;
		pointer-events: none;
	}

	@keyframes sweep {
		from {
			transform: translate3d(0, 75%, 0);
		}
		to {
			transform: translate3d(0, -75%, 0);
		}
	}

	/* ---- Tail & states ---------------------------------------------------- */

	/* Hung below the section's end, where the stage is when it finally lets
	   go. In the flow it sat under the stage's *starting* position instead and
	   crossed the table as a pale band at the top of the scene. */
	.tail {
		position: absolute;
		inset: 100% 0 auto;
		height: 30vh;
		margin-top: -1px;
		background: linear-gradient(to bottom, var(--panel), transparent);
		pointer-events: none;
	}

	.compact .tail {
		display: none;
	}

	.state {
		display: grid;
		justify-items: start;
		align-content: center;
		gap: var(--sp-4);
		min-height: 70vh;
		padding: var(--section-y) var(--gutter);
	}

	.state-line {
		max-width: 14ch;
		font-family: var(--font-display);
		font-size: var(--fs-h1);
		font-weight: 300;
		font-stretch: 82%;
		line-height: 0.95;
		letter-spacing: var(--tracking-display);
	}

	.state-line .u-serif {
		color: var(--ember);
	}

	.state-detail {
		font-family: var(--font-mono);
		font-size: var(--fs-xs);
		color: var(--text-subtle);
	}

	.state .u-btn:disabled {
		opacity: 0.55;
		cursor: progress;
	}

	/* ---- Upright screens --------------------------------------------------- */

	.compact .mobile-panel {
		left: var(--gutter);
		right: var(--gutter);
		top: auto;
		bottom: clamp(0.75rem, 2.4svh, 1.5rem);
		max-width: none;
		gap: var(--sp-3);
		transform: translate3d(0, calc((1 - var(--in)) * 36px), 0);
	}

	.compact .panel :global(.p-name),
	.compact .panel .p-name {
		font-size: clamp(2.1rem, 10vw, 3.4rem);
	}

	.compact .panel .p-sub {
		margin-top: 0.35rem;
		font-size: 1.15rem;
	}

	.compact .panel .p-desc {
		margin-top: 0.6rem;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.compact .panel .p-desc.more {
		-webkit-line-clamp: 9;
		line-clamp: 9;
	}

	.compact .panel .p-spec {
		margin-top: 0.7rem;
	}

	/* Room is short: keep the stack, drop the rest of the table. */
	.compact .panel .p-spec > div:not(:first-child) {
		display: none;
	}

	.compact .panel .p-spec > div {
		grid-template-columns: 3.4rem minmax(0, 1fr);
		padding-block: 0.45rem;
	}

	.compact .arrow {
		width: 2.9rem;
		height: 2.9rem;
	}

	.compact .dot {
		width: 0.7rem;
	}

	.compact .dot.active {
		width: 1.8rem;
	}

	.compact .p-controls {
		gap: var(--sp-3) var(--sp-4);
	}

	.compact .caption-line {
		font-size: clamp(3rem, 15vw, 6rem);
	}

	/* ---- Reduced motion: the acts cut instead of travelling ---------------- */

	@media (prefers-reduced-motion: reduce) {
		.showcase {
			height: 300vh;
		}

		.caption {
			display: none;
		}
	}
</style>
