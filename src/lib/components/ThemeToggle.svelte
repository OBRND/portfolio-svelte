<script lang="ts">
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { theme, toggleTheme } from '$lib/stores/theme';
</script>

<button
	type="button"
	class="theme-toggle"
	onclick={toggleTheme}
	aria-label={$theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
	title={$theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
>
	<span class="icon-wrap" aria-hidden="true">
		{#if $theme === 'dark'}
			<MoonIcon size={17} strokeWidth={1.9} />
		{:else}
			<SunIcon size={17} strokeWidth={1.9} />
		{/if}
	</span>
</button>

<style>
	.theme-toggle {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: var(--bg-elev-1);
		color: var(--text-muted);
		cursor: pointer;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.theme-toggle:hover {
		color: var(--text);
		border-color: var(--line-strong);
		background: var(--bg-inset);
	}

	/* The icon swaps instantly on click; a short rotate-in keeps that from
	   reading as a glitch without delaying the theme change itself. */
	.icon-wrap {
		display: grid;
		place-items: center;
		animation: icon-in var(--dur-base) var(--ease-out);
	}

	@keyframes icon-in {
		from {
			opacity: 0;
			transform: rotate(-35deg) scale(0.8);
		}
	}
</style>
