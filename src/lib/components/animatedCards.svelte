<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	export interface ServiceModalData {
		title: string;
		subtitle: string;
		description: string;
		/** Concrete things I hand over — the substance of the service. */
		delivers: string[];
		/** Stack keywords, rendered as chips. The terms job listings use. */
		stack: string[];
	}

	interface Props {
		title?: string;
		description?: string;
		logo?: string;
		buttonText?: string;
		/** Brand colour for the flooding shape and the card border. */
		animationColor?: string;
		shapeType?: 'circle' | 'wave' | 'blob' | 'tree' | 'triangle' | 'hexagon';
		modalData?: ServiceModalData | null;
	}

	let {
		title = '',
		description = '',
		logo = '',
		buttonText = 'What this covers',
		animationColor = '#ff6b35',
		shapeType = 'circle',
		modalData = null
	}: Props = $props();

	let isHovered = $state(false);
	let isModalOpen = $state(false);
</script>

<article
	class="animated-card"
	class:is-hovered={isHovered}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	style="--shape-color: {animationColor};"
>
	<div class="card-content">
		{#if logo}
			<div class="card-logo">
				<img src={logo} alt="" />
			</div>
		{/if}

		<div class="card-body">
			{#if title}<h3 class="card-title">{title}</h3>{/if}
			{#if description}<p class="card-description">{description}</p>{/if}
		</div>
	</div>

	<!-- The flooding shape. Purely decorative, and never a pointer target. -->
	<div class="svg-container {shapeType}" aria-hidden="true">
		{#if shapeType === 'circle'}
			<svg viewBox="0 0 200 200" preserveAspectRatio="none">
				<circle cx="100" cy="100" r="100" fill={animationColor} />
			</svg>
		{:else if shapeType === 'wave'}
			<svg viewBox="0 0 200 200" preserveAspectRatio="none">
				<path d="M0,200 C50,120 150,120 200,200 L200,200 L0,200 Z" fill={animationColor} />
			</svg>
		{:else if shapeType === 'blob'}
			<svg viewBox="0 0 200 200" preserveAspectRatio="none">
				<path d="M0,200 C30,150 70,180 100,150 C130,120 170,150 200,200 L200,200 L0,200 Z" fill={animationColor} />
			</svg>
		{:else if shapeType === 'tree'}
			<svg viewBox="0 0 200 200" preserveAspectRatio="none">
				<path d="M50,0 C65,0 85,15 85,35 C85,55 65,70 50,70 C35,70 15,55 15,35 C15,15 35,0 50,0 M50,0 C60,-15 80,-15 85,0 C110,10 110,35 85,35 C110,45 110,70 85,70 C80,85 60,85 50,70" fill={animationColor} />
			</svg>
		{:else if shapeType === 'triangle'}
			<svg viewBox="0 0 200 200" preserveAspectRatio="none">
				<path d="M50,10 Q56,10 59,15 L90,75 Q93,80 88,85 L12,85 Q7,80 10,75 L41,15 Q44,10 50,10 Z" fill={animationColor} />
			</svg>
		{:else if shapeType === 'hexagon'}
			<svg viewBox="0 0 200 200" preserveAspectRatio="none">
				<path d="M30,10 Q42,-2 54,10 L74,10 Q86,10 92,22 L100,40 Q106,52 100,64 L92,82 Q86,94 74,94 L54,94 Q42,106 30,94 L16,64 Q10,52 16,40 L24,22 Q30,10 30,10 Z" fill={animationColor} />
			</svg>
		{/if}
	</div>

	<!--
		A single real <button> rather than a clickable <div> wrapping a nested
		button. Its ::after stretches over the whole card, so the entire surface
		stays clickable while there is exactly one tab stop and one accessible name.
	-->
	<button class="card-button" onclick={() => (isModalOpen = true)}>
		<span>{buttonText}</span>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon" aria-hidden="true">
			<line x1="5" y1="12" x2="19" y2="12" />
			<polyline points="12 5 19 12 12 19" />
		</svg>
		<span class="u-sr-only">about {title}</span>
	</button>
</article>

{#if modalData}
	<Modal
		open={isModalOpen}
		title={modalData.title}
		subtitle={modalData.subtitle}
		onclose={() => (isModalOpen = false)}
	>
		<div class="service-detail" style="--shape-color: {animationColor};">
			<p class="lede">{modalData.description}</p>

			<section class="detail-block">
				<h3>What this covers</h3>
				<ul class="delivers">
					{#each modalData.delivers as item}
						<li>
							<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="m5 13 4 4L19 7" />
							</svg>
							<span>{item}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="detail-block">
				<h3>Stack</h3>
				<ul class="stack">
					{#each modalData.stack as item}
						<li>{item}</li>
					{/each}
				</ul>
			</section>
		</div>
	</Modal>
{/if}

<style>
	.animated-card {
		position: relative;
		display: flex;
		flex-direction: column;
		/* Fluid rather than the old fixed 370px, which overflowed the grid on
		   narrow screens. */
		width: 100%;
		min-height: 300px;
		padding: clamp(1.5rem, 3.5vw, 2rem);
		padding-bottom: 3.75rem;
		border-radius: var(--r-md);
		border: 1px solid var(--line);
		background: var(--bg-elev-1);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		isolation: isolate;
		transition:
			transform var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out);
	}

	.animated-card:hover {
		transform: translateY(-3px);
		border-color: var(--shape-color);
		box-shadow: var(--shadow-lg);
	}

	.animated-card:has(.card-button:focus-visible) {
		outline: 2px solid var(--shape-color);
		outline-offset: 3px;
	}

	.card-content {
		position: relative;
		z-index: 2;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-logo {
		margin-bottom: var(--sp-6);
		max-width: 150px;
		height: 40px;
	}

	.card-logo img {
		max-height: 100%;
		width: auto;
	}

	.card-title {
		font-family: var(--font-display);
		font-size: clamp(1.2rem, 2.6vw, 1.5rem);
		font-weight: 700;
		letter-spacing: var(--tracking-head);
		line-height: 1.15;
		margin-bottom: var(--sp-3);
		transition: color var(--dur-base) var(--ease-out);
	}

	.card-description {
		font-size: var(--fs-sm);
		color: var(--text-muted);
		transition: color var(--dur-base) var(--ease-out);
	}

	/* ---- Flooding shape -------------------------------------------------- */

	.svg-container {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		overflow: hidden;
	}

	.svg-container svg {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 70%;
		transform: translateY(60%);
		transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/*
		Resting positions, each shape peeks from a different corner. Scaled up
		~20% from the original set (and, for hexagon/triangle, nudged further
		into the corner) specifically so the shape's fill sits fully behind the
		"What this covers" button at rest, not just grazing its edge.
	*/
	.svg-container.circle svg {
		transform: translate(-22%, 38%) scale(0.75);
	}
	.svg-container.wave svg {
		transform: translate(-50%, -32%) scale(1.75);
	}
	.svg-container.blob svg {
		transform: translate(-40%, -32%) scale(1.75);
	}
	.svg-container.tree svg {
		transform: translate(-35%, -75%) scale(4) rotate(210deg);
	}
	.svg-container.triangle svg {
		transform: translate(10%, 190%) scale(2.7) rotate(45deg);
	}
	.svg-container.hexagon svg {
		transform: translate(16%, -35%) scale(5) rotate(240deg);
	}

	/* Hover, the shape sweeps across and floods the card. Scaled up in step
	   with the resting sizes above so the growth from rest to hover reads as
	   proportional rather than the hover jump suddenly looking smaller. */
	.is-hovered .svg-container.blob svg {
		transform: translate(-65%, -280%) scale(7.2) rotate(10deg);
	}
	.is-hovered .svg-container.wave svg {
		transform: translate(50%, -260%) scale(8) rotate(10deg);
	}
	.is-hovered .svg-container.circle svg {
		transform: translate(0%, -20%) scale(2.3) rotate(-45deg);
	}
	.is-hovered .svg-container.tree svg {
		transform: translate(115%, -340%) scale(13) rotate(260deg);
	}
	.is-hovered .svg-container.triangle svg {
		transform: translate(40%, 300%) scale(7.2) rotate(45deg);
	}
	.is-hovered .svg-container.hexagon svg {
		transform: translate(90%, 80%) scale(6) rotate(350deg);
	}

	.is-hovered .card-title,
	.is-hovered .card-description {
		color: #fff;
	}

	/* ---- Button ---------------------------------------------------------- */

	/*
		Sits closer to the bottom-left corner, over the shape's resting position,
		so the shape reads as tucked behind the button rather than the button
		floating in empty space above it. Its background stays glassy rather than
		a solid pill at rest, so the shape's colour still shows through where the
		two overlap; a light blur keeps the label readable over either the plain
		card or the peeking shape. On hover the shape floods the whole card, so
		the pill switches to a solid chip instead, for guaranteed contrast.
	*/
	.card-button {
		position: absolute;
		bottom: clamp(0.9rem, 2.2vw, 1.25rem);
		left: clamp(0.9rem, 2.2vw, 1.25rem);
		z-index: 3;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		background: color-mix(in srgb, var(--bg-elev-1) 45%, transparent);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		/* Always white at rest rather than the theme's --text: the shape sits
		   behind the button here in both themes, and white reads consistently
		   against it, whereas light mode's dark --text lost contrast against
		   the colour. A soft shadow keeps it legible on the rare sliver where
		   the glass shows plain card background instead. */
		color: #fff;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		font-size: var(--fs-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			color var(--dur-base) var(--ease-out),
			background-color var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out),
			transform var(--dur-base) var(--ease-out);
	}

	/* On hover the card floods with colour, so the pill switches to a solid
	   chip to read against it: white chip, brand-coloured label. */
	.is-hovered .card-button {
		background: #fff;
		border-color: #fff;
		color: var(--shape-color);
	}

	/* Stretches the hit area over the whole card without adding a tab stop. */
	.card-button::after {
		content: '';
		position: absolute;
		inset: -100vmax;
		z-index: -1;
	}

	.card-button:focus-visible {
		outline: none;
	}

	.animated-card:hover .card-button {
		transform: translateX(4px);
	}

	.arrow-icon {
		transition: transform var(--dur-base) var(--ease-out);
	}

	.animated-card:hover .arrow-icon {
		transform: translateX(3px);
	}

	/* ---- Dialog contents -------------------------------------------------- */

	.lede {
		color: var(--text-muted);
		font-size: var(--fs-lead);
		padding-bottom: var(--sp-5);
		border-bottom: 1px solid var(--line);
	}

	.detail-block {
		margin-top: var(--sp-6);
	}

	.detail-block h3 {
		font-family: var(--font-body);
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: var(--sp-4);
	}

	.delivers {
		list-style: none;
		display: grid;
		gap: var(--sp-3);
	}

	.delivers li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
		color: var(--text-muted);
	}

	.delivers svg {
		color: var(--shape-color);
		margin-top: 0.35rem;
	}

	.stack {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.stack li {
		padding: 0.25rem 0.7rem;
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--bg-inset);
		color: var(--text-muted);
		font-size: var(--fs-xs);
		font-weight: 500;
	}

	@media (prefers-reduced-motion: reduce) {
		.svg-container svg {
			transition: none;
		}
	}
</style>
