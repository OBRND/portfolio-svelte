<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { portal } from '$lib/actions/portal';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		/** Accessible name. Rendered as the dialog's heading unless `header` is given. */
		title?: string;
		/** Optional supporting line under the title. */
		subtitle?: string;
		/** Extra classes on the panel — used to attach `.theme-flutter` etc. */
		class?: string;
		onclose?: () => void;
		children?: Snippet;
		/** Replaces the default title block entirely. */
		header?: Snippet;
	}

	let {
		open = false,
		title = '',
		subtitle = '',
		class: className = '',
		onclose,
		children,
		header
	}: Props = $props();

	let panel = $state<HTMLElement | null>(null);
	let previouslyFocused: HTMLElement | null = null;
	let previousOverflow = '';

	const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

	const FOCUSABLE =
		'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

	$effect(() => {
		if (!open) return;

		previouslyFocused = document.activeElement as HTMLElement | null;
		// Preserve whatever the page had rather than forcing `auto` on close,
		// which would clobber an overflow set by something else.
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		// Wait for the panel to exist before moving focus into it.
		const raf = requestAnimationFrame(() => {
			const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
			(first ?? panel)?.focus();
		});

		return () => {
			cancelAnimationFrame(raf);
			document.body.style.overflow = previousOverflow;
			previouslyFocused?.focus?.();
		};
	});

	function onKeydown(event: KeyboardEvent) {
		if (!open) return;

		if (event.key === 'Escape') {
			event.stopPropagation();
			onclose?.();
			return;
		}

		if (event.key !== 'Tab' || !panel) return;

		// Focus trap: cycle within the dialog instead of escaping to the page
		// behind it, which is still rendered and would otherwise be reachable.
		const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
			(el) => el.offsetParent !== null || el === document.activeElement
		);
		if (items.length === 0) return;

		const first = items[0];
		const last = items[items.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<div class="layer" use:portal>
		<div
			class="backdrop"
			transition:fade={{ duration: 200 }}
			onclick={() => onclose?.()}
			role="presentation"
		></div>

		<div
			class="panel {className}"
			bind:this={panel}
			transition:scale={{ duration: 280, start: 0.96, easing: cubicOut }}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			tabindex="-1"
		>
			<button type="button" class="close" onclick={() => onclose?.()} aria-label="Close dialog">
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>

			<div class="head">
				{#if header}
					{@render header()}
				{:else}
					<h2 class="title" id={titleId}>{title}</h2>
					{#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
				{/if}
			</div>

			<div class="content">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.layer {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		display: grid;
		place-items: center;
		padding: var(--sp-4);
	}

	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(8, 9, 12, 0.55);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}

	.panel {
		position: relative;
		width: min(720px, 100%);
		max-height: min(86vh, 900px);
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		border-radius: var(--r-lg);
		border: 1px solid var(--line);
		background: var(--bg-elev-1);
		color: var(--text);
		box-shadow: var(--shadow-xl);
		/* A thin, muted rail rather than the browser's default chrome-grey bar,
		   which read as a leftover system widget against the rest of the page. */
		scrollbar-width: thin;
		scrollbar-color: var(--line-strong) transparent;
	}

	.panel::-webkit-scrollbar {
		width: 6px;
	}

	.panel::-webkit-scrollbar-track {
		background: transparent;
	}

	.panel::-webkit-scrollbar-thumb {
		background-color: var(--line-strong);
		border-radius: var(--r-pill);
	}

	.panel::-webkit-scrollbar-thumb:hover {
		background-color: var(--text-subtle);
	}

	.panel:focus {
		outline: none;
	}

	.close {
		position: absolute;
		top: clamp(0.85rem, 2vw, 1.15rem);
		right: clamp(0.85rem, 2vw, 1.15rem);
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: var(--bg-inset);
		color: var(--text-muted);
		cursor: pointer;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.close:hover {
		background: var(--text);
		color: var(--bg);
	}

	.head {
		padding-right: 2.75rem;
		margin-bottom: var(--sp-5);
	}

	.title {
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 3.2vw, 1.85rem);
		letter-spacing: var(--tracking-head);
		line-height: 1.15;
	}

	.subtitle {
		margin-top: 0.5rem;
		color: var(--accent);
		font-size: var(--fs-sm);
		font-weight: 500;
	}
</style>
