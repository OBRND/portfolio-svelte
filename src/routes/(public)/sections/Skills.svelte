<script lang="ts">
  import { onMount } from 'svelte';
  // Use type import for SSR safety, assuming globe.svelte is the correct path
  import type ReactGlobe from '$lib/components/globe.svelte';

  // Placeholder data for the tech stack
  const techStack: string[] = [
    "Flutter",
    "TypeScript",
    "Svelte / SvelteKit",
    "React / Next.js",
    "Node.js",
    "HTML5 & CSS3", // Grouped for simplicity, can be split if needed
    "Tailwind CSS",
    "Git & GitHub", // Grouped
    "REST APIs",
    "GraphQL",
    "Docker",
    "Figma",
    // Add more or modify as needed
  ];

  // Define colors for each technology for dynamic hover effects
  const techColors = {
    "Flutter": { primary: "#3a9ae9", text: "#323330" }, // Yellow, dark text
    "TypeScript": { primary: "#3178C6", text: "#FFFFFF" }, // Blue, white text
    "Svelte / SvelteKit": { primary: "#FF3E00", text: "#FFFFFF" }, // Svelte Orange, white text
    "React / Next.js": { primary: "#61DAFB", text: "#20232A" }, // React Blue, dark text
    "Node.js": { primary: "#339933", text: "#FFFFFF" }, // Node Green, white text
    "HTML5 & CSS3": { primary: "#E34F26", text: "#FFFFFF" }, // HTML5 Orange, white text
    "Tailwind CSS": { primary: "#06B6D4", text: "#FFFFFF" }, // Teal, white text
    "Git & GitHub": { primary: "#F05033", text: "#FFFFFF" }, // Git Red, white text
    "REST APIs": { primary: "#6C757D", text: "#FFFFFF" }, // Grey, white text
    "GraphQL": { primary: "#E10098", text: "#FFFFFF" }, // GraphQL Pink, white text
    "Docker": { primary: "#2496ED", text: "#FFFFFF" }, // Docker Blue, white text
    "Figma": { primary: "#A259FF", text: "#FFFFFF" } // Figma Purple, white text
  };

  // Helper function to get the primary color for a tech item
  function getTechPrimaryColor(techName: string): string {
    return techColors[techName] ? techColors[techName].primary : '#cccccc'; // Default grey if not found
  }

  // Helper function to get the text color for a tech item's hover state
  function getTechHoverTextColor(techName: string): string {
    return techColors[techName] ? techColors[techName].text : 'var(--text-dark)'; // Default dark text if not found
  }

  // --- START: Globe-related imports and logic (minimal changes) ---
  import trialImage from '$lib/assets/image.png'; // Make sure this path is correct for your image

  const iconSlugsForGlobe = [
    "typescript", "javascript", "dart", "java", "react", "flutter",
    "android", "html5", "css3", "nodedotjs", "express", "nextdotjs",
    "prisma", "amazonaws", "postgresql", "firebase", "nginx", "vercel",
    "testinglibrary", "jest", "cypress", "docker", "git", "jira",
    "github", "gitlab", "visualstudiocode", "androidstudio", "sonarqube",
    "figma", "nonexistenticon"
  ];

  const customImagesForGlobe = [
    trialImage,
  ];

  let currentGlobeTheme = 'dark'; // Or dynamically set based on page theme
  let ReactGlobeComponent: typeof ReactGlobe;

  // New state to manage the active tech item for the "light up" effect
  let activeTechItem: string | null = null;

  // Map simple-icons slugs to your techStack names for comparison
  const slugToTechNameMap: { [key: string]: string } = {
    "typescript": "TypeScript",
    "javascript": "TypeScript", // Assuming JS maps to TypeScript for simplification
    "dart": "Flutter",
    "java": "Flutter", // Or a more specific "Java" entry if you have it
    "react": "React / Next.js",
    "flutter": "Flutter",
    "android": "Flutter", // Flutter builds Android apps
    "html5": "HTML5 & CSS3",
    "css3": "HTML5 & CSS3",
    "nodedotjs": "Node.js",
    "express": "Node.js", // Express is a Node.js framework
    "nextdotjs": "React / Next.js",
    "prisma": "Node.js", // Or a new category if you wish
    "amazonaws": "REST APIs", // Generic for cloud services often used with APIs
    "postgresql": "REST APIs", // Databases often connect via APIs
    "firebase": "REST APIs", // Firebase offers REST APIs
    "nginx": "REST APIs", // Nginx can proxy APIs
    "vercel": "React / Next.js", // Vercel is for Next.js deployments
    "testinglibrary": "React / Next.js", // Testing libraries are usually framework-specific
    "jest": "React / Next.js", // Jest is for JavaScript testing
    "cypress": "React / Next.js", // Cypress is for web testing
    "docker": "Docker",
    "git": "Git & GitHub",
    "jira": "Git & GitHub", // Project management often tied to Git
    "github": "Git & GitHub",
    "gitlab": "Git & GitHub",
    "visualstudiocode": "TypeScript", // IDE for coding
    "androidstudio": "Flutter", // IDE for Android/Flutter
    "sonarqube": "Git & GitHub", // Code quality tool, often integrated with Git
    "figma": "Figma"
  };

  function handleIconClick(slug: string) {
    const techName = slugToTechNameMap[slug];
    if (techName && techStack.includes(techName)) {
      activeTechItem = techName;
      // You can add a timeout here to remove the active state after a few seconds
      setTimeout(() => {
        activeTechItem = null;
      }, 1000); // Lights up for 1 second
    } else {
      activeTechItem = null; // Clear if no match
    }
  }

  onMount(async () => {
    // Dynamically import the component only on the client
    const { default: LoadedReactGlobe } = await import('$lib/components/globe.svelte'); // Ensure this path is correct
    ReactGlobeComponent = LoadedReactGlobe;
  });
  // --- END: Globe-related imports and logic ---
</script>

<div class="toolkit-page-section">
  <section class="my-toolkits-card-section">
    <div class="section-content-wrapper">
      <h2 class="section-title centered-title">MY TOOLKITS</h2>

      <div class="globe-area">
        {#if ReactGlobeComponent}
          <svelte:component
            this={ReactGlobeComponent}
            iconSlugs={iconSlugsForGlobe}
            imageArray={customImagesForGlobe}
            theme={"light"}
            onIconClick={handleIconClick}
          />
        {:else}
          <p>Loading interactive globe...</p>
        {/if}
      </div>
      <div class="stack-grid">
        {#each techStack as tech}
          <div
            class="tech-item"
            class:active={activeTechItem === tech} style="--hover-bg: {getTechPrimaryColor(tech)}; --hover-text: {getTechHoverTextColor(tech)};"
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
          <img src="/flutter-dash-illustration.png" alt="Flutter Dash" class="tech-illustration" />
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
          <img src="/svelte-logo-illustration.png" alt="Svelte Logo" class="tech-illustration" />
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
    padding: 0;
    background-color: var(--bg-primary); /* Overall light grey background for the toolkit page */
  }

  .section-content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem; /* Horizontal padding for content */
    box-sizing: border-box;
    background-color: var(--bg-primary);
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
    font-size: 1.3rem; /* Smaller, like "ABOUT ME" */
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

  /* --- NEW GLOBE AREA STYLES (MINIMAL) --- */
  .globe-area {
    width: 100%; /* Take full width of its parent (.section-content-wrapper) */
    max-width: 100%;
    height: 100%; /* Limit the max width of the globe container */
    max-height: 100%; /* Fixed height for the globe area */
    margin: 0 auto 0rem auto; /* Center it horizontally and add space below */
    display: flex; /* For centering content inside, like "Loading..." text */
    justify-content: center;
    align-items: center;
    overflow: hidden; /* Crucial to prevent globe from overflowing its bounds */
    /* No background, no shadow, no border-radius. It will inherit from .toolkit-page-section */
  }

  /* My Toolkit Grid Styling (inside the grey section) */
  .stack-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem; /* Reverted gap */
    max-width: 1000px; /* Adjust max-width within the section */
    margin: 0 auto;
    justify-content: center; /* Center tech items on mobile */
  }

  .tech-item {
    background-color: var(--bg-white); /* White background for individual tech items */
    color: var(--text-dark); /* Default dark text */
    padding: 0.8rem 1.5rem; /* Reverted padding */
    border-radius: 25px;
    font-size: 0.95rem; /* Reverted font size */
    font-weight: 600;
    border: 1px solid #d0d0d0; /* Subtle border */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Lighter shadow */
    transition: all 0.3s ease-in-out;
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    /* Dynamic hover colors */
    --hover-bg: #cccccc; /* Fallback */
    --hover-text: var(--bg-white); /* Fallback */
  }

  /* The new .active class to trigger the "hover" effect */
  .tech-item.active {
    background: var(--hover-bg); /* Use dynamic background */
    color: var(--hover-text); /* Use dynamic text color */
    transform: translateY(-5px) scale(1.05); /* Reverted transform */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Reverted shadow */
    border-color: transparent;
  }

  .tech-item:hover {
    background: var(--hover-bg); /* Use dynamic background */
    color: var(--hover-text); /* Use dynamic text color */
    transform: translateY(-5px) scale(1.05); /* Reverted transform */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Reverted shadow */
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
    background: linear-gradient(45deg, var(--flutter-blue), var(--svelte-orange));
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

  /* Responsive adjustments */

  /* Tablet (>= 768px) */
  @media (min-width: 768px) {
    .section-content-wrapper {
        padding: 0 2rem;
    }

    /* My Toolkits Section */
    .my-toolkits-card-section {
      padding: 4rem 0; /* Reduced padding */
      margin: 4rem auto; /* Reduced margin */
    }
    .my-toolkits-card-section .centered-title {
      font-size: 1.5rem;
      margin-bottom: 2.5rem; /* Reduced margin */
    }
    /* Globe area adjustments */
    .globe-area {
        max-width: 500px; /* Allow globe to be slightly larger */
        height: 500px; /* Slightly increased height */
        padding-bottom: 4rem;
      }
    .stack-grid {
      gap: 1rem; /* Reduced gap */
      justify-content: flex-start;
    }
    .tech-item {
      padding: 0.8rem 1.6rem; /* Reduced padding */
      font-size: 0.95rem; /* Reduced font size */
    }

    /* Why Tech Section Desktop */
    .why-tech-section {
      padding: 5rem 0; /* Reduced padding */
    }
    .why-tech-container {
      gap: 2.5rem; /* Reduced gap */
      flex-direction: row;
      align-items: stretch;
    }
    .why-tech-card {
      padding: 2.5rem; /* Reverted card padding */
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

  /* Desktop (>= 1024px) */
  @media (min-width: 1024px) {
      .section-content-wrapper {
          padding: 0 3rem;
      }

    /* My Toolkits Section */
    .my-toolkits-card-section {
        padding: 0rem 0; /* Reduced padding */
        margin: 0rem auto; /* Reduced margin */
    }
    .my-toolkits-card-section .centered-title {
        font-size: 1.8rem;
        margin-bottom: 3rem; /* Reduced margin */
    }
    /* Globe area adjustments */
    .globe-area {
        max-width: 500px; /* Even larger on desktop */
        height: 500px; /* Increased height for desktop */
        padding-bottom: 4rem; /* Adjust space below globe for larger screens */
    }
    .stack-grid {
        gap: 1.2rem; /* Reduced gap */
    }
    .tech-item {
        padding: 0.9rem 1.8rem; /* Reduced padding */
        font-size: 1rem; /* Reduced font size */
    }

    /* Why Tech Section Desktop */
    .why-tech-section {
        padding: 6rem 0; /* Reduced padding */
    }
    .why-tech-container {
        gap: 3rem; /* Reduced gap */
    }
    .why-tech-card {
        padding: 3rem; /* Reduced padding */
    }
    .tech-name {
        font-size: 2rem; /* Adjusted font size */
    }
    .why-point h4 {
        font-size: 1.15rem; /* Adjusted font size */
    }
    .why-point p {
        font-size: 0.98rem; /* Adjusted font size */
    }
  }

    /* Adjust content wrapper max-width for extra large screens */
    @media (min-width: 1400px) {
        .section-content-wrapper {
            max-width: 1300px;
        }
    }

</style>