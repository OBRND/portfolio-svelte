<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  // Import the functions from the new .jsx file
  import { mountReactGlobe, updateReactGlobe, unmountReactGlobe } from './react/render.jsx';

  // Props to pass to the React component
  export let iconSlugs: string[] = [];
  export let imageArray: string[] = [];
  export let theme: string = 'light';
  export let onIconClick: (slug: string) => void = () => {}; // New prop to pass the click handler

  let container: HTMLDivElement;
  let reactRoot: any; // To store the React root instance

  onMount(() => {
    if (browser) {
      // Call the function from the .jsx file to mount the React component
      reactRoot = mountReactGlobe(container, { iconSlugs, imageArray, initialTheme: theme, onIconClick });
    }
  });

  onDestroy(() => {
    if (browser && reactRoot) {
      // Call the function from the .jsx file to unmount the React component
      unmountReactGlobe(reactRoot);
    }
  });

  // Reactive statement to update React component if props change
  $: if (browser && reactRoot) {
    // Call the function from the .jsx file to update the React component
    updateReactGlobe(reactRoot, { iconSlugs, imageArray, initialTheme: theme, onIconClick });
  }
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>

<style>
  /* Any styles for the container div */
</style>