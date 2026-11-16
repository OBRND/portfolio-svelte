<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		src?: string;
		/**
		 * Tried once if `src` fails — the unsigned public Storage URL, which
		 * recovers screenshots whose signed link has expired.
		 */
		fallbackSrc?: string;
		alt?: string;
		/** Shown in place of the screenshot when there is none to show. */
		label?: string;
		loading?: 'eager' | 'lazy';
		/**
		 * Slowly travels down a screenshot that is taller than its frame and
		 * back again, the way you would scroll a page to look at it.
		 */
		pan?: boolean;
	}

	let { src = '', fallbackSrc = '', alt = '', label = '', loading = 'lazy', pan = false }: Props = $props();

	let failed = $state(false);
	let loaded = $state(false);
	let usingFallback = $state(false);
	let img = $state<HTMLImageElement | null>(null);

	const currentSrc = $derived(usingFallback ? fallbackSrc : src);

	function onError() {
		if (!usingFallback && fallbackSrc && fallbackSrc !== src) {
			usingFallback = true;
			return;
		}
		failed = true;
	}

	// A server-rendered image can finish (or fail) before hydration attaches
	// the handlers, in which case the event has been and gone.
	onMount(() => {
		if (!img?.complete) return;
		if (img.naturalWidth) loaded = true;
		else onError();
	});
</script>

<div class="shot" class:loaded class:pan>
	{#if currentSrc && !failed}
		<img
			bind:this={img}
			src={currentSrc}
			{alt}
			{loading}
			decoding="async"
			draggable="false"
			onload={() => (loaded = true)}
			onerror={onError}
		/>
	{:else}
		<div class="empty"><span>{label}</span></div>
	{/if}
</div>

<style>
	.shot {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: #0a0b0f;
		container-type: inline-size;
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		object-fit: cover;
		object-position: 50% 0;
		opacity: 0;
		transition: opacity 500ms ease;
		user-select: none;
	}

	.loaded img {
		opacity: 1;
	}

	.pan.loaded img {
		animation: pan 18s var(--ease-in-out) 1.2s infinite alternate;
	}

	@keyframes pan {
		to {
			object-position: 50% 100%;
		}
	}

	.empty {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 8cqw;
		background:
			radial-gradient(90% 60% at 20% 10%, color-mix(in srgb, var(--azure) 50%, transparent), transparent 70%),
			radial-gradient(90% 60% at 80% 95%, color-mix(in srgb, var(--ember) 55%, transparent), transparent 70%),
			#0a0b0f;
		color: #ece6d9;
		text-align: center;
	}

	.empty span {
		font-family: var(--font-display);
		font-size: 12cqw;
		font-weight: 300;
		font-stretch: 75%;
		line-height: 0.9;
		letter-spacing: -0.03em;
		overflow-wrap: anywhere;
	}

	@media (prefers-reduced-motion: reduce) {
		.pan.loaded img {
			animation: none;
		}
	}
</style>
