<script lang="ts">
	interface Props {
		/** `phone` for Flutter work, `browser` for Svelte/web work. */
		variant?: 'phone' | 'browser';
		src?: string;
		alt?: string;
		/**
		 * Tried once if `src` fails — the unsigned public Storage URL, which
		 * recovers images whose signed link has expired.
		 */
		fallbackSrc?: string;
		/** Shown in the browser chrome's address pill. Ignored by `phone`. */
		url?: string;
		/** Eager for the first card in a stack, lazy for the rest. */
		loading?: 'eager' | 'lazy';
	}

	let {
		variant = 'phone',
		src = '',
		alt = '',
		fallbackSrc = '',
		url = '',
		loading = 'lazy'
	}: Props = $props();

	let failed = $state(false);
	let loaded = $state(false);
	let usingFallback = $state(false);
	/**
	 * The loaded image's own width/height, as a CSS ratio string. The phone
	 * frame sizes itself to this instead of a fixed ratio, so it fits
	 * whatever a screenshot actually is rather than cropping (or padding a
	 * mismatched one) to a guessed shape. `null` until an image has actually
	 * loaded, during which `.device.phone`'s CSS default carries the frame.
	 */
	let naturalAspect = $state<string | null>(null);

	const currentSrc = $derived(usingFallback ? fallbackSrc : src);

	// Reset the load state when the stack deals a different project into this
	// frame, otherwise a previously-failed image keeps the error state forever.
	$effect(() => {
		src;
		failed = false;
		loaded = false;
		usingFallback = false;
		naturalAspect = null;
	});

	function onImageLoad(event: Event) {
		loaded = true;
		const img = event.currentTarget as HTMLImageElement;
		if (img.naturalWidth && img.naturalHeight) {
			naturalAspect = `${img.naturalWidth} / ${img.naturalHeight}`;
		}
	}

	function onImageError() {
		// One retry against the public URL, then give up and show the placeholder.
		if (!usingFallback && fallbackSrc && fallbackSrc !== src) {
			usingFallback = true;
			return;
		}
		failed = true;
	}

	function hostOf(link: string) {
		if (!link) return 'localhost';
		try {
			return new URL(link.startsWith('http') ? link : `https://${link}`).host.replace(/^www\./, '');
		} catch {
			return link;
		}
	}
</script>

<div
	class="device {variant}"
	class:is-loaded={loaded}
	style={variant === 'phone' && naturalAspect ? `aspect-ratio: ${naturalAspect};` : ''}
>
	{#if variant === 'browser'}
		<div class="chrome">
			<div class="lights" aria-hidden="true">
				<span></span><span></span><span></span>
			</div>
			<div class="omnibox" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
					<rect x="4" y="11" width="16" height="10" rx="2" />
					<path d="M8 11V7a4 4 0 0 1 8 0v4" />
				</svg>
				<span>{hostOf(url)}</span>
			</div>
		</div>
	{/if}

	<div class="screen">
		{#if currentSrc && !failed}
			<img
				src={currentSrc}
				{alt}
				{loading}
				decoding="async"
				onload={onImageLoad}
				onerror={onImageError}
			/>
		{:else}
			<div class="fallback">
				<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<path d="m21 15-5-5L5 21" />
				</svg>
				<span>Screenshot coming soon</span>
			</div>
		{/if}

		{#if currentSrc && !failed && !loaded}
			<div class="shimmer" aria-hidden="true"></div>
		{/if}

		<div class="glare" aria-hidden="true"></div>
	</div>

	{#if variant === 'phone'}
		<span class="btn power" aria-hidden="true"></span>
		<span class="btn vol-up" aria-hidden="true"></span>
		<span class="btn vol-down" aria-hidden="true"></span>
	{/if}
</div>

<style>
	.device {
		--bezel: #16181d;
		--bezel-edge: #33373f;
		position: relative;
		width: 100%;
		background: var(--bezel);
		box-shadow:
			0 0 0 1px var(--bezel-edge),
			var(--shadow-lg);
	}

	:global(:root.dark) .device {
		--bezel: #0c0e12;
		--bezel-edge: #2c313b;
		/* A soft edge-light in the section's own colour (flutter blue / svelte
		   orange, via the `.theme-*` ancestor) so the canvas reads as lit from
		   behind rather than a flat panel — kept well under the stronger glow
		   used on the card itself and the portrait, so it stays a halo, not a
		   second spotlight. */
		box-shadow:
			0 0 0 1px var(--bezel-edge),
			var(--shadow-lg),
			0 0 46px -20px var(--accent-edge, transparent),
			0 0 14px -8px var(--accent-edge, transparent);
	}

	/* ---- Phone ---------------------------------------------------------- */

	.device.phone {
		/* Only a starting point for the loading/placeholder state — once a
		   screenshot loads, the inline style set from its own naturalWidth /
		   naturalHeight (see DeviceFrame.svelte's `onImageLoad`) takes over,
		   so the frame fits that image's real shape instead of cropping it
		   to a guessed one. 1080x2340 just keeps the empty frame from
		   flashing some other shape before an image arrives. */
		aspect-ratio: 1080 / 2340;
		border-radius: clamp(1.6rem, 5vw, 2.4rem);
		padding: clamp(5px, 1.2vw, 9px);
	}

	.phone .screen {
		border-radius: clamp(1.25rem, 4vw, 2rem);
	}

	.btn {
		position: absolute;
		background: var(--bezel-edge);
		border-radius: 2px;
	}
	.btn.power {
		right: -2px;
		top: 26%;
		width: 2px;
		height: 9%;
	}
	.btn.vol-up {
		left: -2px;
		top: 20%;
		width: 2px;
		height: 6%;
	}
	.btn.vol-down {
		left: -2px;
		top: 28%;
		width: 2px;
		height: 6%;
	}

	/* ---- Browser -------------------------------------------------------- */

	.device.browser {
		border-radius: clamp(0.65rem, 1.6vw, 0.9rem);
		padding: 0 clamp(4px, 0.8vw, 7px) clamp(4px, 0.8vw, 7px);
		display: flex;
		flex-direction: column;
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: clamp(0.5rem, 1.6vw, 0.85rem);
		height: clamp(26px, 4.4vw, 38px);
		padding-inline: clamp(0.5rem, 1.4vw, 0.8rem);
		flex-shrink: 0;
	}

	.lights {
		display: flex;
		gap: clamp(4px, 0.9vw, 6px);
		flex-shrink: 0;
	}
	.lights span {
		width: clamp(7px, 1.3vw, 10px);
		aspect-ratio: 1;
		border-radius: 50%;
		background: #3a3f49;
	}
	.lights span:nth-child(1) {
		background: #ec6a5e;
	}
	.lights span:nth-child(2) {
		background: #f4bf50;
	}
	.lights span:nth-child(3) {
		background: #61c554;
	}

	.omnibox {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
		flex: 1;
		min-width: 0;
		height: clamp(15px, 2.6vw, 22px);
		padding-inline: 0.75em;
		border-radius: var(--r-pill);
		background: #23262d;
		color: #7d838f;
		font-family: var(--font-body);
		font-size: clamp(0.5rem, 1.05vw, 0.7rem);
		font-weight: 500;
		letter-spacing: 0.01em;
	}
	.omnibox span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.omnibox svg {
		flex-shrink: 0;
	}

	.browser .screen {
		aspect-ratio: 16 / 10;
		border-radius: clamp(0.35rem, 0.9vw, 0.5rem);
	}

	/* ---- Shared screen -------------------------------------------------- */

	.screen {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--bg-sunken);
		isolation: isolate;
	}

	.screen img {
		width: 100%;
		height: 100%;
		/* Top-aligned cover: app and site screenshots carry their identity in
		   the header, so overflow is cropped from the bottom. */
		object-fit: cover;
		object-position: top center;
		opacity: 0;
		transition: opacity var(--dur-slow) var(--ease-out);
	}

	.is-loaded .screen img {
		opacity: 1;
	}

	.fallback {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--sp-3);
		height: 100%;
		padding: var(--sp-4);
		text-align: center;
		color: var(--text-subtle);
		background: var(--bg-inset);
		font-size: var(--fs-xs);
	}

	.shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			100deg,
			transparent 20%,
			var(--line-hairline) 45%,
			transparent 70%
		);
		background-size: 220% 100%;
		animation: sweep 1.4s var(--ease-in-out) infinite;
	}

	@keyframes sweep {
		from {
			background-position: 160% 0;
		}
		to {
			background-position: -60% 0;
		}
	}

	/* Fixed diagonal sheen — sells the glass without animating anything. */
	.glare {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(
			118deg,
			rgba(255, 255, 255, 0.14) 0%,
			rgba(255, 255, 255, 0.04) 26%,
			transparent 46%
		);
		z-index: 2;
	}

	:global(:root.dark) .glare {
		background: linear-gradient(
			118deg,
			rgba(255, 255, 255, 0.07) 0%,
			rgba(255, 255, 255, 0.02) 26%,
			transparent 46%
		);
	}
</style>
