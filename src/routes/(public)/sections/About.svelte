<script lang="ts">
  // Import onMount for Svelte lifecycle management
  import { onMount } from 'svelte';
  // Import the lottie-web library directly. This assumes it's installed via npm/yarn.
  import lottie from 'lottie-web';

  // Declare a variable to hold the reference to the Lottie container div
  let lottieContainer: HTMLDivElement;

  onMount(() => {
    // Initialize Lottie animation
    lottie.loadAnimation({
      container: lottieContainer, // The DOM element to render the animation in
      renderer: 'svg', // Render as SVG for scalability
      loop: true, // Loop the animation
      autoplay: true, // Autoplay the animation
      path: '/Animation.json' // Path to your Lottie JSON file (ensure this path is correct)
    });
  });
</script>

<div class="about-me-page">
  <header class="top-section">
    <div class="avatar-container">
      <!-- This div will now host your Lottie animation -->
      <div bind:this={lottieContainer} class="lottie-animation-container"></div>
    </div>
    <div class="intro-text-container">
      <h1 class="name-heading">Hello, I'm Obsan</h1>
      <h2 class="subtitle">A Full stack developer</h2>
      <p class="summary-simple">
        <b> I specialize in <span class="flutter-blue-text">Mobile</span> and <span class="svelte-orange-text">web app development</span> using <span class="flutter-blue-text">Flutter</span> and <span class="svelte-orange-text">Svelte</span></b>
      </p>
    </div>
  </header>

  <section class="about-me-detailed-section">
    <div class="section-content-wrapper">
      <h2 class="section-title centered-title">ABOUT ME</h2>
      <div class="about-me-columns">
        <div class="about-column">
          <p>
            I’ve been drawn to technology from an early age. Growing up in Addis Ababa, where tech lagged behind, I saw the need and potential for change.
          </p>
          <p>
            That inspired me to pursue a career in tech. So I studied Software Engineering at Mekelle University, Then I focused on crafting real-world solutions.
          </p>
        </div>
        <div class="about-column">
          <p>
            I'm passionate about creating smooth, user-friendly digital experiences. My goal is to contribute to the next wave of meaningful tech innovation.
          </p>
          <p>
            Beyond coding, I enjoy reading, fitness, drawing, and painting. These help me reset and often spark creative "aha" moments in my work.
          </p>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  /* Define CSS variables for easier theming */
  :root {
    --flutter-blue: #3a9ae9;
    --svelte-orange: #FF3E00;
    --text-dark: #2c3e50;
    --text-medium: #555;
    --text-light: #f0f0f0; /* Lighter text for dark backgrounds */
    --bg-light-purple: #f8f4fa;
    --bg-white: #ffffff;
    /* Removed variables specific to the toolkit/why sections as they are in the new file */
  }

  .about-me-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    width: 100%;
    overflow-x: hidden;
    background-color: var(--bg-color);
    /* color: var(--text-dark); */
    line-height: 1.6;
    padding: 0;
  }

  .section-content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    box-sizing: border-box;
    background-color: var(--bg-color);
  }

  /* Brand-specific highlighted text (for summary-simple) */
  .flutter-blue-text {
    color: var(--flutter-blue);
    font-weight: 600;
  }

  .svelte-orange-text {
    color: var(--svelte-orange);
    font-weight: 600;
  }

  /* Top Section: Avatar + Intro */
  .top-section {
    display: flex;
    flex-direction: column; /* Stack on mobile */
    align-items: center; /* Center items when stacked */
    padding: 2rem 1.5rem 4rem 1.5rem; /* Reduced top padding, adjusted bottom */
    gap: 2rem;
    margin-bottom: 0;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--bg-primary);
  }

  .avatar-container {
    flex-shrink: 0;
    width: 300px; /* Increased size for mobile */
    height: 300px; /* Increased size for mobile */
    border-radius: 100%; /* Maintains the circular background */
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, var(--flutter-blue), var(--svelte-orange)); /* Gradient using new theme colors */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  /* New Lottie container styling */
  .lottie-animation-container {
    width: 120%; /* Lottie takes 80% of avatar-container's width */
    height: 120%; /* Lottie takes 80% of avatar-container's height */
    display: flex;
    justify-content: center;
    align-items: center;
    /* Removed border-radius here to ensure Lottie isn't clipped if it's not perfectly circular */
  }

  .intro-text-container {
    flex-grow: 1;
    flex-shrink: 1;
    text-align: center; /* Center text on mobile */
    max-width: 100%;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .name-heading {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg,var(--svelte-orange), var(--flutter-blue), var(--flutter-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    line-height: 1.1;
    text-align: center;
  }

  .subtitle {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-dark);
    margin-top: 0;
    margin-bottom: 0rem;
    line-height: 1.2;
    text-align: center;
  }

  .summary-simple {
    font-size: 1rem;
    color: var(--text-medium);
    margin-top: 0;
    margin-bottom: 0;
    text-align: center;
  }

  /* About Me Detailed Section */
  .about-me-detailed-section {
    margin-bottom: 0;
    padding-top: 4rem;
    padding-bottom: 0rem;
    background-color: var(--bg-primary);
    width: 100%;
    box-sizing: border-box;
  }

  .centered-title {
    text-align: center;
    font-size: 1.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2.5rem;
    color: var(--text-dark);
    position: relative;
    display: inline-block;
    padding-bottom: 0.5rem;
  }

  .about-me-detailed-section .section-content-wrapper {
    text-align: center;
  }

  .centered-title::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: var(--svelte-orange);
    border-radius: 2px;
  }

  .about-me-columns {
    display: flex;
    flex-direction: column; /* Stack on mobile */
    gap: 1.5rem;
    font-size: 1rem;
    color: var(--text-medium);
    max-width: 900px;
    margin: 0 auto;
    text-align: left;
  }
  .about-column p {
    margin-bottom: 0;
    line-height: 1.7;
  }

  /* Responsive adjustments */

  /* Tablet (>= 768px) */
  @media (min-width: 768px) {
    .top-section {
      flex-direction: row;
      align-items: center;
      padding: 4rem 2rem 5rem 2rem;
      gap: 4rem;
    }

    .avatar-container {
      max-width: 260px; /* Increased size for tablet */
      max-height: 260px; /* Increased size for tablet */
    }

    .lottie-animation-container {
      width: 80%;
      height: 80%;
    }

    .intro-text-container {
      flex: 1 1 60%;
      text-align: left;
      max-width: 100%;
      margin: 0;
    }

    .name-heading {
      font-size: 4.5rem;
      text-align: left;
    }

    .subtitle {
      font-size: 4rem;
      margin-bottom: 1rem;
      text-align: left;
    }

    .summary-simple {
      font-size: 1.1rem;
      text-align: left;
    }

    .about-me-detailed-section {
      padding-top: 5rem;
      padding-bottom: 5rem;
    }

    .section-content-wrapper {
      padding: 0 2rem;
    }

    .about-me-columns {
      flex-direction: row;
      gap: 2.5rem;
      font-size: 1rem;
    }
    .about-column p {
      line-height: 1.8;
    }
  }

  /* Desktop (>= 1024px) */
  @media (min-width: 1024px) {
    .top-section {
      padding: 5rem 3rem 10rem 3rem;
      gap: 6rem;
    }

    .avatar-container {
      max-width: 320px; /* Increased size for desktop */
      max-height: 320px; /* Increased size for desktop */
    }

    .lottie-animation-container {
      width: 80%;
      height: 80%;
    }

    .intro-text-container {
      flex: 1 1 60%;
    }

    .name-heading {
      font-size: 5.5rem;
    }

    .subtitle {
      font-size: 5rem;
      margin-bottom: 0.5rem;
    }

    .summary-simple {
      font-size: 1.2rem;
    }

    .about-me-detailed-section {
      padding-top: 6rem;
      padding-bottom: 6rem;
    }

    .section-content-wrapper {
      padding: 0 3rem;
    }

    .about-me-columns {
      gap: 3rem;
      font-size: 1.05rem;
    }
    .about-column p {
      line-height: 1.9;
    }
  }

  /* Adjust content wrapper max-width for extra large screens */
  @media (min-width: 1400px) {
    .section-content-wrapper {
      max-width: 1300px;
    }
  }
</style>
