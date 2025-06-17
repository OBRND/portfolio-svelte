<script lang="ts">
    import SunIcon from "@lucide/svelte/icons/sun";
    import MoonIcon from "@lucide/svelte/icons/moon";
    import { theme } from '$lib/stores/theme';
    
    $: currentTheme = $theme;
    
    function toggleTheme() {
      theme.set(currentTheme === 'dark' ? 'light' : 'dark');
    }
  </script>
  
  <button
    on:click={toggleTheme}
    class="theme-toggle"
    aria-label="Toggle theme"
    title={currentTheme === 'dark' ? "Click for light mode" : "Click for dark mode"}
  >
    {#if currentTheme === 'dark'}
      <MoonIcon class="icon" />
    {:else}
      <SunIcon class="icon" />
    {/if}
  </button>
  
  <style>
    .theme-toggle {
      /* Rectangular button with curved edges */
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      padding: 0.5rem;
      
      /* Center icon */
      display: flex;
      align-items: center;
      justify-content: center;
      
      /* Default light mode styles */
      background: #f0f0f0;
      color: #333;
      border: none;
      outline: none;
      cursor: pointer;
      transition: all 0.3s ease;
      
      /* Tooltip cursor */
      position: relative;
    }
  
    /* Dark mode styles */
    :global(.dark) .theme-toggle {
      background: #333;
      color: #f0f0f0;
    }
  
    .theme-toggle:hover {
      opacity: 0.9;
      transform: scale(1.05);
    }
  
    .icon {
      width: 1.2rem;
      height: 1.2rem;
    }
  </style>