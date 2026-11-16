<script lang="ts">
	import Hero from './sections/Hero.svelte';
	import Manifesto from './sections/Manifesto.svelte';
	import Stack from './sections/Stack.svelte';
	import Tools from './sections/Tools.svelte';
	import Services from './sections/Services.svelte';
	import Showcase from './sections/Showcase.svelte';
	import Contact from './sections/contact/+page.svelte';

	let { data } = $props();

	const projects = $derived(data.projects ?? []);
</script>

<svelte:head>
	<title>Obsan Diribsa — Flutter &amp; SvelteKit Developer</title>
	<meta
		name="description"
		content="Flutter and SvelteKit developer in Addis Ababa. I design the systems behind the apps: data models, services, customer and operator apps, admin consoles."
	/>
</svelte:head>

<!--
	Each section moves differently, on purpose:

	Hero       pinned — the name splits apart and the portrait dissolves
	Manifesto  pinned — the sentence is inked in word by word as you scroll
	Stack      free   — two belts of type counter-scroll behind the globe
	Tools      free   — two halves slide in from opposite sides
	Services   sticky — five posters stack over one another
	Showcase   pinned — a phone rises to show the mobile work, then a laptop
	                    opens and the camera pushes into its screen for the web
	Contact    free   — line reveals, and a ticker driven by the scroll

	The pinned ones register resting points with the scroll engine, which
	settles onto the nearest one when the scroll stops close to it.
-->
<Hero />
<Manifesto />
<Stack />
<Tools />
<Services />
<Showcase {projects} projectsError={data.projectsError} />
<Contact />
