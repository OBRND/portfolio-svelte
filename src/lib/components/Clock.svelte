<script lang="ts">
	import { onMount } from 'svelte';
	import { person } from '$lib/data/site';

	/**
	 * Local time where Obsan is. Blank on the server and filled in on mount: the
	 * server's clock and the visitor's first paint are seconds apart at best,
	 * and rendering a time on both would be a guaranteed hydration mismatch.
	 */
	let time = $state('');

	onMount(() => {
		const format = new Intl.DateTimeFormat('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: person.timeZone
		});
		const update = () => (time = format.format(new Date()));
		update();
		const timer = setInterval(update, 15_000);
		return () => clearInterval(timer);
	});
</script>

<span class="clock">{time || '--:--'} {person.timeZoneLabel}</span>

<style>
	.clock {
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>
