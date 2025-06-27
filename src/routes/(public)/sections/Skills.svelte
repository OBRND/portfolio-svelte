<script lang="ts">
  import { onMount } from 'svelte';
  // 1. Ensure the theme store is imported
  import { theme } from '../../../lib/stores/theme'; // Adjust path if needed
  import type ReactGlobe from '$lib/components/globe.svelte';

  const simpleIconSlugs = [
    "javascript",
    "python",
    "flutter", // Use 'flutter' for the simple-icon
    "css3",
    "android",
    "git",
    "html5",
    "googlecloud",
    "github",
    "figma",
    "sqlite",
    "postgresql", // Best simple-icon match for SQL
    "supabase",
    "vercel",
    "firebase",
    "svelte",
    "cplusplus"
    ];

  // For custom images (SVGs). Each object will contain the path and a unique identifier for mapping.
  const customImageData = [
    { src: '/java.svg', id: 'java', alt: 'Java Logo' },
    { src: '/flutter_flow.webp', id: 'flutterflow', alt: 'flutterflow Logo' }, // Assuming you have a custom 'web' icon now
    { src: '/hive.webp', id: 'hive-logo', alt: 'Hive Logo' },
  ];

  const techStack: string[] = [
    "JavaScript",
    "Java",
    "Python",
    "Flutter",        // Simple icon (if you want both Flutter Dash and generic Flutter)
    "CSS",
    "Android Development",
    "Git",
    "HTML",
    "Google Cloud",
    "Hive",           // Custom icon
    "GitHub",
    "Figma",
    "FlutterFlow",
    "SQLite",
    "PostgreSQL",
    "Supabase",
    "Vercel",
    "Firebase",
    "Svelte",
    "C++"
  ];

  const techColors = {
    "JavaScript": { primary: "#F7DF1E", text: "#323330" },
    "Flutter Dash": { primary: "#02569B", text: "#FFFFFF" },
    "Java": { primary: "#007396", text: "#FFFFFF" },
    "Python": { primary: "#3776AB", text: "#FFFFFF" },
    "Web Development": { primary: "#E34F26", text: "#FFFFFF" },
    "Flutter": { primary: "#02569B", text: "#FFFFFF" },
    "CSS": { primary: "#1572B6", text: "#FFFFFF" },
    "Android Development": { primary: "#3DDC84", text: "#2C3E50" },
    "Git": { primary: "#F05033", text: "#FFFFFF" },
    "HTML": { primary: "#E34F26", text: "#FFFFFF" },
    "Google Cloud": { primary: "#4285F4", text: "#FFFFFF" },
    "Hive": { primary: "#02569B", text: "#FFFFFF" },
    "GitHub": { primary: "#181717", text: "#FFFFFF" }, // Default light mode GitHub
    "Figma": { primary: "#F24E1E", text: "#FFFFFF" },
    "FlutterFlow": { primary: "#492fdd", text: "#FFFFFF" },
    "SQLite": { primary: "#003B57", text: "#FFFFFF" },
    "PostgreSQL": { primary: "#4479A1", text: "#FFFFFF" },
    "Supabase": { primary: "#3ECF8E", text: "#18181B" },
    "Vercel": { primary: "#000000", text: "#FFFFFF" }, // Default light mode Vercel
    "Firebase": { primary: "#FFCA28", text: "#2C3E50" },
    "Svelte": { primary: "#FF3E00", text: "#FFFFFF" },
  };


  function getTechPrimaryColor(techName: string, currentTheme: string): string {
    const defaultColor = '#cccccc'; // Fallback

    if (techColors[techName]) {
     return techColors[techName].primary;
    }
    return defaultColor;
  }

  function getTechHoverTextColor(techName: string, currentTheme: string): string {
    const defaultTextColor = 'var(--text-dark)'; // Fallback

    if (techColors[techName]) {
            return techColors[techName].text;
    }
    return defaultTextColor;
  }

  let ReactGlobeComponent: typeof ReactGlobe;
  let activeTechItem: string | null = null;
  let showClickHint = true;
  let hoverAreaActive = false;
  let globeAreaElement: HTMLElement;

  const slugToTechNameMap: { [key: string]: string } = {
    "javascript": "JavaScript",
    "java": "Java",
    "python": "Python",
    "flutter": "Flutter",
    "css3": "CSS",
    "android": "Android Development",
    "git": "Git",
    "html5": "HTML",
    "googlecloud": "Google Cloud",
    "hive-logo": "Hive",
    "github": "GitHub",
    "figma": "Figma",
    "flutterflow": "FlutterFlow",
    "sqlite": "SQLite",
    "postgresql": "PostgreSQL",    
    "supabase": "Supabase",
    "vercel": "Vercel",
    "firebase": "Firebase",                                               
    "svelte": "Svelte",
    "cplusplus": "C++"
  };
  function handleIconClick(identifier: string) {
    const techName = slugToTechNameMap[identifier];
    if (techName && techStack.includes(techName)) {
      activeTechItem = techName;
      setTimeout(() => {
        activeTechItem = null;
      }, 1000);
    } else {
      activeTechItem = null;
    }
  }

  function handleGlobeAreaMouseEnter() {
    hoverAreaActive = true;
  }

  function handleGlobeAreaMouseLeave() {
    hoverAreaActive = false;
  }

  function dismissClickHint() {
    showClickHint = false;
  }

  onMount(async () => {
    const { default: LoadedReactGlobe } = await import('$lib/components/globe.svelte');
    ReactGlobeComponent = LoadedReactGlobe;
  });
</script>

<div class="toolkit-page-section">
  <section class="my-toolkits-card-section">
    <div class="section-content-wrapper">
      <h2 class="section-title centered-title">MY TOOLKITS</h2>

      <div 
        class="globe-area"
        bind:this={globeAreaElement}
        on:mouseenter={handleGlobeAreaMouseEnter}
        on:mouseleave={handleGlobeAreaMouseLeave}
        on:click={dismissClickHint}
      >
        {#if ReactGlobeComponent}
          <svelte:component
            this={ReactGlobeComponent}
            iconSlugs={simpleIconSlugs}
            imageArray={customImageData}
            theme={$theme}
            onIconClick={handleIconClick}
          />
        {:else}
          <p>Loading interactive globe...</p>
        {/if}
        
        <!-- Click hint indicator -->
        {#if showClickHint}
          <div class="click-hint-overlay">
            <div class="click-hint-content">
              <div class="click-hint-icon">
                <i class="fas fa-hand-pointer"></i>
              </div>
              <!-- Different text for different screen sizes -->
              <p class="click-hint-text desktop-text">Click on the icons to highlight them below</p>
              <p class="click-hint-text mobile-text">Tap on the tech icons to highlight them below!</p>
              <div class="click-hint-pulse"></div>
            </div>
          </div>
        {/if}

        <!-- Hover tooltip - only for desktop -->
        {#if hoverAreaActive}
          <div class="hover-tooltip">
            <i class="fas fa-mouse-pointer"></i>
            Click on any tech icon!
          </div>
        {/if}
      </div>

      <div class="stack-grid">
        {#each techStack as tech}
          <div
            class="tech-item"
            class:active={activeTechItem === tech}
            style="--hover-bg: {getTechPrimaryColor(tech, $theme)}; --hover-text: {getTechHoverTextColor(tech, $theme)};"
          >
            <span>{tech}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="why-tech-section">
    <div class="section-content-wrapper why-tech-container">
      <div class="why-tech-card flutter-theme">
        <div class="tech-icon-container">
          <img src="/flutter-logo.webp" alt="Flutter Dash" class="tech-illustration" />
        </div>
        <div class="tech-intro-text">
          <h3 class="tech-name">WHY FLUTTER</h3>
          <div class="why-points">
            <div class="why-point">
              <div class="icon-box">
                <i class="fas fa-coins icon"></i>
              </div>
              <div class="point-content">
                <h4>Save Money & Time</h4>
                <p>Your app works on iPhone, Android, and web from one codebase—cutting development costs by up to half.</p>
              </div>
            </div>
            <div class="why-point">
              <div class="icon-box">
                <i class="fas fa-paint-brush icon"></i>
              </div>
              <div class="point-content">
                <h4>Stunning, Smooth Design</h4>
                <p>Beautiful apps that feel fast and responsive, giving your customers the premium experience they expect.</p>
              </div>
            </div>
            <div class="why-point">
              <div class="icon-box">
                <i class="fas fa-rocket icon"></i>
              </div>
              <div class="point-content">
                <h4>Launch Faster</h4>
                <p>Get your product to market weeks earlier than traditional development, helping you beat competitors and start earning sooner.</p>
              </div>
            </div>
            <div class="why-point">
              <div class="icon-box">
                <i class="fas fa-shield-alt icon"></i>
              </div>
              <div class="point-content">
                <h4>Future-Proof Your App</h4>
                <p>Backed by Google and used by major brands worldwide, ensuring your app stays modern and supported for years to come.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="why-tech-card svelte-theme">
        <div class="tech-icon-container">
          <img src="/svelte_logo.webp" alt="Svelte Logo" class="tech-illustration" />
        </div>
        <div class="tech-intro-text">
          <h3 class="tech-name">WHY SVELTE</h3>
          <div class="why-points">
            <div class="why-point">
              <div class="icon-box">
                <i class="fas fa-bolt icon"></i>
              </div>
              <div class="point-content">
                <h4>Lightning Fast</h4>
                <p>Your website will load and run incredibly fast, giving customers a smooth, instant experience.</p>
              </div>
            </div>
            <div class="why-point">
              <div class="icon-box">
                <i class="fas fa-bezier-curve icon"></i>
              </div>
              <div class="point-content">
                <h4>Intuitive & Responsive</h4>
                <p>Creates highly responsive interfaces that adapt beautifully to any device for a seamless user experience.</p>
              </div>
            </div>
            <div class="why-point">
              <div class="icon-box">
                <i class="fas fa-file-code icon"></i>
              </div>
              <div class="point-content">
                <h4>Efficient Development</h4>
                <p>Less code means quicker development and easier updates, saving you time and money.</p>
              </div>
            </div>
            <div class="why-point">
              <div class="icon-box">
                <i class="fas fa-check-circle icon"></i>
              </div>
              <div class="point-content">
                <h4>Seamless User Experience</h4>
                <p>Designed for simplicity, leading to a high-quality product and a delightful, intuitive user experience.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  /* Define CSS variables for easier theming */
  :root {
    --flutter-blue: #02569B;
    --svelte-orange: #FF3E00;
    --text-dark: #2c3e50;
    --text-medium: #555;
    --text-light: #f0f0f0; /* Lighter text for dark backgrounds */
    --bg-light-purple: #f8f4fa; /* Used for background of toolkit page and why-tech section */
    --bg-white: #ffffff;
    --card-border-radius: 12px;
    --card-padding: 2.5rem; /* Reverted card padding for why-tech-card */
  }

  /* Base styles for the new component */
  .toolkit-page-section {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    width: 100%;
    overflow-x: hidden;
    color: var(--text-color);
    line-height: 1.6;   
    padding-left: 2rem;
    padding-right: 2rem;
    background-color: var(--bg-primary); /* Overall light grey background for the toolkit page */
  }

  .section-content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem; /* Horizontal padding for content */
    box-sizing: border-box;
    background-color: var(--bg-primary);
    position: relative; /* Add positioning context for tooltip */
  }

  /* Common section title styles (used for "My Toolkits" and "Why Flutter/Svelte" titles) */
  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 2rem; /* Reverted margin */
    color: var(--text-dark);
    text-align: center;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 0.5rem;
  }

  /* Styling for the "MY TOOLKITS" section (greyish background) */
  .my-toolkits-card-section {
    background-color: var(--bg-primary); /* Greyish background for the section */
    border-radius: 0; /* No border-radius */
    box-shadow: none; /* No shadow */
    padding: 2.5rem 0 3rem 0; /* Reduced padding inside the section */
    margin: 0; /* No top/bottom margin */
    width: 100%; /* Take full width */
    box-sizing: border-box;
  }

  /* Ensure the title is centered within its wrapper */
  .my-toolkits-card-section .section-content-wrapper {
    text-align: center; /* Center inline-block children like centered-title */
  }

  .my-toolkits-card-section .centered-title {
    font-size: 1.8rem; /* Smaller, like "ABOUT ME" */
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2rem; /* Reduced space below title inside the section */
    color: var(--text-dark);
    position: relative;
    display: inline-block; /* Essential for centering with text-align and for ::after */
    padding-bottom: 0.5rem;
  }

  .my-toolkits-card-section .centered-title::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: var(--svelte-orange); /* Svelte orange underline */
    border-radius: 2px;
  }

  /* --- GLOBE AREA STYLES - ORIGINAL LAYOUT FOR LARGE SCREENS --- */
  .globe-area {
    width: 100%; /* Take full width of its parent (.section-content-wrapper) */
    max-width: 100%;
    height: 100%; /* Original flexible height */
    max-height: 100%; /* Original flexible max-height */
    margin: 0 auto 2rem auto; /* Original spacing */
    display: flex; /* For centering content inside, like "Loading..." text */
    justify-content: center;
    align-items: center;
    position: relative; /* For absolute positioning of click hint */
    /* No background, no shadow, no border-radius. It will inherit from .toolkit-page-section */
  }

  /* My Toolkit Grid Styling - JUSTIFIED FOR ALL SCREENS */
  .stack-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem; /* Original gap for mobile, will be adjusted for larger screens */
    max-width: 1000px; /* Adjust max-width within the section */
    margin: 0 auto;
    justify-content: space-between; /* Justified alignment for all screens */
    text-align: justify; /* Additional justification */
  }

  /* Add a pseudo-element to help with justification on the last line */
  .stack-grid::after {
    content: '';
    flex: auto;
  }

  .tech-item {
    background-color: var(--bg-secondary); /* White background for individual tech items */
    color: var(--text-color); /* Default dark text */
    padding: 0.8rem 1.5rem; /* Original padding for mobile */
    border-radius: 25px; /* Original border radius */
    font-size: 0.95rem; /* Original font size for mobile */
    font-weight: 600;
    border: 1px solid #696969; /* Subtle border */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Lighter shadow */
    transition: all 0.3s ease-in-out;
    display: inline-flex;
    align-items: center; 
    cursor: pointer;
    flex: 0 1 auto; /* Allow items to shrink and grow as needed for justification */
    min-width: fit-content; /* Ensure text doesn't wrap */

    /* Dynamic hover colors */
    --hover-bg: #cccccc; /* Fallback */
    --hover-text: var(--bg-white); /* Fallback */
  }

  /* The new .active class to trigger the "hover" effect */
  .tech-item.active {
    background: var(--hover-bg); /* Use dynamic background */
    color: var(--hover-text); /* Use dynamic text color */
    transform: translateY(-5px) scale(1.05); /* Original transform */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Original shadow */
    border-color: transparent;
  }

  .tech-item:hover {
    background: var(--hover-bg); /* Use dynamic background */
    color: var(--hover-text); /* Use dynamic text color */
    transform: translateY(-5px) scale(1.05); /* Original transform */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Original shadow */
    border-color: transparent;
  }

  /* Why Tech Section (Why Flutter & Why Svelte) */
  .why-tech-section {
    padding: 4rem 0; /* Reduced vertical padding for this section */
    background-color: var(--bg-primary); /* Light purple background for this section */
    width: 100%;
    box-sizing: border-box;
    color: var(--text-color); /* Default text for this section */
  }

  .why-tech-container {
    display: flex;
    flex-direction: column; /* Stack on mobile */
    gap: 2.5rem; /* Reduced gap between cards */
    align-items: stretch; /* Stretch cards to equal height */
  }

  .why-tech-card {
    flex: 1; /* Equal width on desktop */
    padding: var(--card-padding);
    border-radius: var(--card-border-radius);
    text-align: center; /* Center content on mobile */
    background-color: var(--bg-secondary); /* White background for cards */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* Lighter shadow for white cards */
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .why-tech-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow on hover */
  }

  .tech-icon-container {
    margin-bottom: 1.2rem; /* Reduced margin */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tech-illustration {
    max-width: 140px; /* Slightly reduced size of illustrations */
    height: auto;
    display: block;
  }

  .tech-intro-text {
    flex-grow: 1;
    width: 100%;
  }

  .tech-name {
    font-size: 1.7rem; /* Slightly reduced font size */
    font-weight: 700;
    margin-bottom: 1.2rem; /* Reduced margin */
    line-height: 1.2;
    /* Gradient for tech names - common base */
    background: linear-gradient(45deg, var(--flutter-blue), #75bce6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }

  /* Svelte specific gradient for tech-name */
  .svelte-theme .tech-name {
    background: linear-gradient(45deg, var(--svelte-orange), #ff6a00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }

  .why-points {
    display: flex;
    flex-direction: column;
    gap: 1rem; /* Reduced gap */
    text-align: left; /* Align points text left */
  }

  .why-point {
    display: flex;
    align-items: flex-start; /* Align icon and text at the top */
    gap: 1rem; /* Remove gap here, controlled by icon-box width */
  }

  .icon-box { /* New fixed-width container for icons */
    width: 2.5rem; /* Fixed width for icon container */
    flex-shrink: 0; /* Prevent shrinking */
    display: flex;
    justify-content: center; /* Center icon horizontally */
    align-items: flex-start; /* Align icon to the top within its box */
    padding-top: 0.15rem; /* Fine-tune vertical alignment with text */
  }

  .why-point .icon {
    font-size: 1.4rem; /* Slightly reduced icon size */
    color: var(--flutter-blue); /* Default icon color */
  }

  .svelte-theme .why-point .icon {
    color: var(--svelte-orange); /* Svelte theme icon color */
  }

  .why-point .point-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .why-point h4 {
    font-size: 1.05rem; /* Slightly reduced font size */
    font-weight: 600;
    margin: 0 0 0.2rem 0; /* Reduced margin */
    color: var(--text-color); /* Title color for white background */
  }

  .why-point p {
    font-size: 0.9rem; /* Reduced font size */
    color: var(--text-color); /* Description color for white background */
    margin: 0;
    line-height: 1.4; /* Reduced line height */
  }

  /* Click hint and hover effects */
  .globe-area {
    position: relative;
    cursor: pointer;
  }

  .click-hint-overlay {
    position: absolute;
    top: 15px;
    right: 300px;
    z-index: 10;
    pointer-events: none;
    animation: fadeInBounce 0.8s ease-out;
  }

  .click-hint-content {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--text-color);
    padding: 0.8rem 1.2rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    position: relative;
    max-width: 180px;
    text-align: center;
  }

  :global(.dark) .click-hint-content {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-light);
  }

  .click-hint-icon {
    font-size: 1.3rem;
    margin-bottom: 0.4rem;
    animation: pointPulse 2s infinite;
    color: var(--svelte-orange);
  }

  .click-hint-text {
    font-size: 0.8rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    color: var(--text-color);
  }

  /* Show/hide different text based on screen size */
  .desktop-text {
    display: none;
  }

  .mobile-text {
    display: block;
  }

  .click-hint-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border: 2px solid rgba(255, 62, 0, 0.4);
    border-radius: 16px;
    animation: pulseRing 2s infinite;
    pointer-events: none;
  }

  .hover-tooltip {
    position: absolute;
    top: 15px;
    right: 220px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    color: var(--text-color);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    z-index: 1000;
    pointer-events: none;
    white-space: nowrap;  
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    animation: tooltipFadeIn 0.2s ease-out;
    display: none; /* Hidden by default, shown only on desktop */
  }

  .hover-tooltip i {
    margin-right: 0.5rem;
    color: var(--svelte-orange);
  }

  /* Animations */
  @keyframes fadeInBounce {
    0% {
      opacity: 0;
      transform: translateY(-20px) scale(0.8);
    }
    60% {
      opacity: 1;
      transform: translateY(5px) scale(1.05);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes pointPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  @keyframes pulseRing {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.3);
      opacity: 0;
    }
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive adjustments */

  /* Tablet (>= 768px) - ORIGINAL LAYOUT RESTORED */
  @media (min-width: 768px) {
    .section-content-wrapper {
        padding: 0 2rem;
    }

    /* My Toolkits Section */
    .my-toolkits-card-section {
      padding: 4rem 0; /* Original padding */
      margin: 4rem auto; /* Original margin */
    }
    .my-toolkits-card-section .centered-title {
      font-size: 1.8rem;
      margin-bottom: 2.5rem; /* Original margin */
    }
    /* Globe area adjustments - ORIGINAL LAYOUT */
    .globe-area {
        max-width: 500px; /* Original max-width */
        height: 500px; /* Original height */
        padding-bottom: 4rem; /* Original padding */
      }
    .stack-grid {
      gap: 1rem; /* Original gap */
      justify-content: space-between; /* Keep justified alignment */
    }
    .tech-item {
      padding: 0.8rem 1.6rem; /* Original padding */
      font-size: 0.95rem; /* Original font size */
    }

    /* Show desktop text, hide mobile text */
    .desktop-text {
      display: block;
    }
    .mobile-text {
      display: none;
    }

    /* Show hover tooltip on desktop */
    .hover-tooltip {
      display: block;
      right: -100px; /* Position to the right of the click hint */
    }

    /* Why Tech Section Desktop */
    .why-tech-section {
      padding: 5rem 0; /* Original padding */
    }
    .why-tech-container {
      gap: 2.5rem; /* Original gap */
      flex-direction: row;
      align-items: stretch;
    }
    .why-tech-card {
      padding: 2.5rem; /* Original card padding */
    }
    .tech-icon-container {
      justify-content: flex-start;
    }
    .tech-name {
      font-size: 1.8rem;
    }
    .why-point h4 {
      font-size: 1.1rem;
    }
    .why-point p {
      font-size: 0.95rem;
    }
  }

  /* Desktop (>= 1024px) - ORIGINAL LAYOUT RESTORED */
  @media (min-width: 1024px) {
      .section-content-wrapper {
          padding: 0 3rem;
      }

    /* My Toolkits Section */
    .my-toolkits-card-section {
        padding: 0rem 0; /* Original padding */
        margin: 0rem auto; /* Original margin */
    }
    .my-toolkits-card-section .centered-title {
        font-size: 2.5rem;
        margin-bottom: 3rem; /* Original margin */
    }
    /* Globe area adjustments - ORIGINAL LAYOUT */
    .globe-area {
        max-width: 500px; /* Original max-width */
        height: 500px; /* Original height */
        padding-bottom: 4rem; /* Original padding */
    }
    .stack-grid {
        gap: 1.2rem; /* Original gap */
        justify-content: space-between; /* Keep justified alignment */
    }
    .tech-item {
        padding: 0.9rem 1.8rem; /* Original padding */
        font-size: 1rem; /* Original font size */
    }

    /* Why Tech Section Desktop */
    .why-tech-section {
        padding: 6rem 0; /* Original padding */
    }
    .why-tech-container {
        gap: 3rem; /* Original gap */
    }
    .why-tech-card {
        padding: 3rem; /* Original padding */
    }
    .tech-name {
        font-size: 2rem; /* Original font size */
    }
    .why-point h4 {
        font-size: 1.15rem; /* Original font size */
    }
    .why-point p {
        font-size: 0.98rem; /* Original font size */
    }
  }

    /* Adjust content wrapper max-width for extra large screens */
    @media (min-width: 1400px) {
        .section-content-wrapper {
            max-width: 1300px;
        }
    }

  /* Extra small screens - OPTIMIZED FOR MOBILE */
  @media (max-width: 500px) {
    .section-content-wrapper {
        padding: 0 0rem;
    }

    /* My Toolkits Section - REDUCED SPACE */
    .my-toolkits-card-section {
      padding: 2rem 0 2rem 0; /* Much reduced padding */
      margin: 2rem auto; /* Much reduced margin */
    }
    .my-toolkits-card-section .centered-title {
      font-size: 1.6rem; /* Smaller title */
      margin-bottom: 1.5rem; /* Much reduced margin */
    }
    /* Globe area adjustments - COMPACT BUT NO OVERLAP */
    .globe-area {
        max-width: 100%;
        height: 100%; /* Compact height but sufficient */
        padding-bottom: 1rem; /* Minimal padding to save space */
        margin-bottom: 1.5rem; /* Sufficient margin to prevent overlap */
      }
    .stack-grid {
      gap: 0.4rem; /* Very tight gap */
      justify-content: space-between; /* Keep justified alignment */
    }
    .tech-item {
      padding: 0.4rem 0.8rem; /* Very small padding */
      font-size: 0.7rem; /* Very small font */
      border-radius: 15px; /* Smaller border radius */
    }
    .tech-item.active,
    .tech-item:hover {
      transform: translateY(-2px) scale(1.02); /* Minimal transform */
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); /* Smaller shadow */
    }

    /* Click hint adjustments for mobile */
    .click-hint-overlay {
      top: 8px;
      right: 200px;
    }
    
    .click-hint-content {
      padding: 0.6rem 0.9rem;
      max-width: 140px;
    }
    
    .click-hint-text {
      font-size: 0.7rem;
    }
    
    .click-hint-icon {
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
    }

    /* Hide hover tooltip on mobile */
    .hover-tooltip {
      display: none;
    }

    /* Why Tech Section */
    .why-tech-section {
      padding: 3rem 0; /* Reduced padding */
    }
    .why-tech-container {
      gap: 2rem; /* Reduced gap */
      flex-direction: column;
      align-items: stretch;
    }
    .why-tech-card {
      padding: 1.5rem 1rem; /* Much reduced padding */
    }
    .tech-icon-container {
      justify-content: center;
      margin-bottom: 1rem;
    }
    .tech-illustration {
      max-width: 100px; /* Smaller illustration */
    }
    .tech-name {
      font-size: 1.5rem; /* Smaller tech name */
      margin-bottom: 1rem;
    }
    .why-point h4 {
      font-size: 1rem;
    }
    .why-point p {
      font-size: 0.85rem;
    }    
  }
</style>