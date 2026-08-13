<script lang="ts">
	import About from './sections/About.svelte';
	import Skills from './sections/Skills.svelte';
	import WhyTech from './sections/WhyTech.svelte';
	import Services from './sections/service.svelte';
	import Projects from './sections/Projects.svelte';
	import Contact from './sections/contact/+page.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Obsan Diribsa: Flutter &amp; SvelteKit Developer</title>
	<meta
		name="description"
		content="Cross-platform mobile developer building production Flutter apps and server-rendered SvelteKit web apps. Delivery, fintech and planning products shipped to the App Store and Play Store."
	/>
</svelte:head>

<!--
	Sections no longer force `min-height: 100vh`. Each block owns its vertical
	rhythm through `--section-y`, so short sections stop leaving dead space and
	long ones stop being squeezed.
-->
<section id="about" class="anchor">
	<About />
</section>

<section id="skills" class="anchor">
	<Skills />
	<WhyTech />
</section>

<section id="services" class="anchor">
	<Services />
</section>

<section id="projects" class="anchor">
	<Projects projects={data.projects} projectsError={data.projectsError} />
</section>

<section id="contact" class="anchor">
	<Contact />
</section>

<style>
	/* `scroll-margin-top` keeps the sticky navbar from covering a section
	   heading when it is scrolled to from the nav. */
	.anchor {
		scroll-margin-top: 5rem;
	}
</style>
