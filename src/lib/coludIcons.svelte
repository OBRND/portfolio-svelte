<script lang="ts">
  import { onMount } from 'svelte';
  // Use type import for SSR safety
  import type ReactGlobe from '$lib/components/globe.svelte'; // Adjusted to globe.svelte based on error

  import trialImage from '$lib/assets/image.png';

  const slugs = [
    "typescript", "javascript", "dart", "java", "react", "flutter",
    "android", "html5", "css3", "nodedotjs", "express", "nextdotjs",
    "prisma", "amazonaws", "postgresql", "firebase", "nginx", "vercel",
    "testinglibrary", "jest", "cypress", "docker", "git", "jira",
    "github", "gitlab", "visualstudiocode", "androidstudio", "sonarqube",
    "figma", "nonexistenticon"
  ];

  const customImages = [
    trialImage,
  ];

  let currentTheme = 'dark';
  let ReactGlobeComponent: typeof ReactGlobe;

  onMount(async () => {
    const { default: LoadedReactGlobe } = await import('$lib/components/globe.svelte'); // Adjusted to globe.svelte
    ReactGlobeComponent = LoadedReactGlobe;
  });
</script>

<div class="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg px-20 pb-20 pt-8 bg-transparent">
  {#if ReactGlobeComponent}
    <svelte:component this={ReactGlobeComponent} iconSlugs={slugs} imageArray={customImages} theme={currentTheme} />
  {:else}
    <p>Loading interactive globe...</p>
  {/if}
</div>

<style>
  /* ... styles ... */
</style>