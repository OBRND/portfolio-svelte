<script lang="ts">
  import { theme } from '../../../lib/stores/theme'; // Adjust path if needed

  let src = '/ob1.webp'; // Default image for light mode
  let isdarkmode = true;
  const darkSrc = '/ob.webp'; // Your image for dark mode (e.g., a darker version)
 
  $: {
    if ($theme === 'dark') {
      src = darkSrc;
      isdarkmode = true;
    } else {
      src = '/ob1.webp'; // Ensure it reverts to the light mode image
      isdarkmode = false;
    }
  }

  // Function to handle CV download
  function downloadCV() {
    // Replace with your actual CV file path
    const link = document.createElement('a');
    link.href = '/Obsan Diribsa CV.pdf'; // Update this path to your CV file
    link.download = 'Obsan_Diribsa\'s CV.pdf';
    link.click();
  }

  // Social media links - replace with your actual links
  const socialLinks = {
    github: 'https://github.com/OBRND',
    linkedin: 'https://linkedin.com/in/yourusername',
    telegram: 'https://t.me/OBDREAMER',
    gmail: 'mailto:obsannew@gmail.com'
  };

  function openLink(url: string) {
    window.open(url, '_blank');
  }
</script>

<div class="about-me-page">
  <header class="top-section">
    <div class="avatar-container">
      <img {src} alt="OB" class="circular-image"/>
    </div>
    <div class="intro-text-container">
      <h1 class="name-heading">Hello, I'm Obsan</h1>
      <h2 class="subtitle">A Full stack developer</h2>
      <div class="tagline-container">
        <p class="tagline-text">
          <span class="flutter-highlight">
            <span class="flutter-blue-text">Flutter</span> developer by day
          </span>
          <span class="connector"></span>
          <span class="svelte-highlight">
            <span class="svelte-orange-text">Svelte</span> developer by night
          </span>
        </p>
      </div>
      <div class="actions-container">
        <button class="btn-download-cv {isdarkmode ? 'dark' : 'light'}" on:click={downloadCV}>
          <div class="btn-content">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span class="btn-text">Download CV</span>
          </div>
          <div class="btn-shine"></div>
        </button>
        
        <div class="social-icons">
          <button class="social-icon {isdarkmode ? 'dark' : 'light'}" on:click={() => openLink(socialLinks.github)} title="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </button>
          
          <button class="social-icon {isdarkmode ? 'dark' : 'light'}" on:click={() => openLink(socialLinks.linkedin)} title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          
          <button class="social-icon {isdarkmode ? 'dark' : 'light'}" on:click={() => openLink(socialLinks.telegram)} title="Telegram">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </button>
          
          <button class="social-icon {isdarkmode ? 'dark' : 'light'}" on:click={() => openLink(socialLinks.gmail)} title="Gmail">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <section class="about-me-detailed-section">
    <div class="section-content-wrapper">
      <h2 class="section-title centered-title">ABOUT ME</h2>
      <div class="about-me-columns">
        <div class="about-column">
          <p>
            I've been drawn to technology from an early age. Growing up in Addis Ababa, where tech lagged behind, I saw the need and potential for change.
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
  }

  .about-me-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    width: 100%;
    overflow-x: visible;
    margin-left: 2rem;
    margin-right: 2rem;
    /* Use CSS variables for background colors */
    background-color: var(--bg-primary); 
    line-height: 1.6;
    padding: 0;
    color: var(--text-dark); /* Apply text color based on theme */
  }

  .section-content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    box-sizing: border-box;
    background-color: var(--bg-primary); /* Use CSS variables */
  }

  /* Brand-specific highlighted text */
  .flutter-blue-text {
    color: var(--flutter-blue);
    font-weight: 700;
    font-size: 1.1em;
  }

  .svelte-orange-text {
    color: var(--svelte-orange);
    font-weight: 700;
    font-size: 1.1em;
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
    background-color: var(--bg-primary); /* Use CSS variables */
  }

  .avatar-container {
    flex-shrink: 0;
    width: 300px; /* Increased size for mobile */
    height: 300px; /* Increased size for mobile */
    border-radius: 50%; /* Make the container circular */
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--bg-secondary); /* Use CSS variables */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden; /* Ensure image is clipped to the circle */
  }

  .circular-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures the image covers the circular area without distortion */
    border-radius: 50%; /* Make the image itself circular */
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
    font-size: 3.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    letter-spacing: -0.2rem;
    line-height: 1.1;
    text-align: center;
    background-clip: text;
    background: linear-gradient(90deg, #287fe4, #C73E73, #ec3c10);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 2.5rem;
    font-weight: 600;
    letter-spacing: -0.2rem;
    background: linear-gradient(90deg, #287fe4, #C73E73, #ec3c10);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-top: 0;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    text-align: center;
  }

  /* Enhanced tagline styling */
  .tagline-container {
    position: relative;
    margin-bottom: 2rem;
    padding: 1.5rem 0;
  }

  .tagline-text {
    font-size: 1.3rem;
    font-weight: 500;
    letter-spacing: -0.05rem;
    color: var(--text-medium);
    margin: 0;
    text-align: center;
    line-height: 1.4;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .flutter-highlight, .svelte-highlight {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: 25px;
    background: linear-gradient(135deg, rgba(58, 154, 233, 0.1), rgba(58, 154, 233, 0.05));
    border: 1px solid rgba(58, 154, 233, 0.2);
    transition: all 0.3s ease;
  }

  .svelte-highlight {
    background: linear-gradient(135deg, rgba(255, 62, 0, 0.1), rgba(255, 62, 0, 0.05));
    border: 1px solid rgba(255, 62, 0, 0.2);
  }

  .flutter-highlight:hover, .svelte-highlight:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .connector {
    font-style: italic;
    color: var(--text-medium);
    font-weight: 400;
    margin: 0 0.5rem;
  }

  /* Actions Container for Button and Social Icons */
  .actions-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
  }

  /* Base Download CV Button Styles */
  .btn-download-cv {
    position: relative;
    overflow: hidden;
    border: none;
    border-radius: 50px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 180px;
    height: 56px;
    cursor: pointer;
    font-family: inherit;
  }

  /* Dark mode button colors */
  .btn-download-cv.dark {
    background: rgb(40, 40, 41);
    color: white;
    box-shadow: 0 4px 15px rgba(40, 40, 41, 0.3);
  }

  .btn-download-cv.dark:hover:not(:disabled) {
    background: #34495e;
    box-shadow: 0 8px 25px rgba(52, 73, 94, 0.4);
  }

  /* Light mode button colors */
  .btn-download-cv.light {
    background: #635e5ac0;
    color: white;
    box-shadow: 0 4px 15px rgba(99, 93, 90, 0.3);
  }

  .btn-download-cv.light:hover:not(:disabled) {
    background: #b6c7d8;
    color: black;
    box-shadow: 0 8px 25px rgba(233, 236, 239, 0.4);
  }

  .btn-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  .btn-text {
    transition: all 0.3s ease;
  }

  .btn-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.6s ease;
  }

  .btn-download-cv:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .btn-download-cv:hover:not(:disabled) .btn-icon {
    transform: translateX(4px) rotate(15deg);
  }

  .btn-download-cv:hover:not(:disabled) .btn-shine {
    left: 100%;
  }

  .btn-download-cv:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-download-cv:disabled {
    opacity: 0.7;
    transform: none;
  }

  .btn-download-cv:disabled .btn-content {
    opacity: 0.8;
  }

  /* Loading animation for disabled state */
  .btn-download-cv:disabled .btn-icon {
    animation: spin 1s linear infinite;
  }

  /* Social Icons Styling */
  .social-icons {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  /* Base social icon styles */
  .social-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  /* Dark mode colors */
  .social-icon.dark {
    background: rgb(40, 40, 41);
    color: white;
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.3);
  }

  .social-icon.dark:hover {
    background: #34495e;
    box-shadow: 0 4px 12px rgba(44, 62, 80, 0.4);
  }

  /* Light mode colors */
  .social-icon.light {
    background: #635d5ac0;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .social-icon.light:hover {
    background: #b6c7d8;
    color: black;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .social-icon svg {
    width: 24px;
    height: 24px;
  }

  .social-icon:hover {
    transform: translateY(-2px);
  }

  .social-icon:active {
    transform: translateY(0);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* About Me Detailed Section */
  .about-me-detailed-section {
    margin-bottom: 0;
    padding-top: 4rem;
    padding-bottom: 0rem;
    background-color: var(--bg-primary); /* Use CSS variables */
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
    color: var(--text-dark); /* Use CSS variables */
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
    color: var(--text-medium); /* Use CSS variables */
    max-width: 900px;
    margin: 0 auto;
    text-align: left;
  }
  .about-column p {
    margin-bottom: 0;
    line-height: 1.7;
    padding-bottom: 1rem;
  }

  /* Responsive adjustments */

  /* Tablet (>= 768px) */
  @media (min-width: 768px) {
    .top-section {
      flex-direction: row;
      align-items: flex-start; /* Align content to top */
      padding: 4rem 2rem 2rem; /* Reduced bottom padding */
      gap: 4rem;
      min-height: 90vh;
      justify-content: center;
    }

    .avatar-container {
      align-self: center;
      flex: 0 0 35%; /* Takes 35% of width */
      max-width: 35%;
      width: 100%;
      height: auto;
      aspect-ratio: 1/1; /* Maintain square shape */
    }

    .intro-text-container {
      flex: 0 0 60%; /* Takes 60% of width (leaving 5% for gap) */
      max-width: 60%;
      align-self: center; /* Center vertically within flex container */
    }
    
    .name-heading {
      font-size: 3.5rem;
      text-align: left;
    }

    .subtitle {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .tagline-text {
      font-size: 1.4rem;
      text-align: left;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .tagline-container {
      margin-bottom: 2.5rem;
    }

    .actions-container {
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      gap: 2rem;
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

  /* laptop (>= 768px) */
  @media (min-width: 1000px) {
    .top-section {
      padding: 4rem 2rem 2rem; /* Reduced bottom padding */
      gap: 2.5rem;
    }

    .centered-title {
    font-size: 2.5rem;
  }

    .avatar-container {
      align-self: center;
      flex: 0 0 35%; /* Takes 35% of width */
      max-width: 35%;
      width: 100%;
      height: auto;
      aspect-ratio: 1/1; /* Maintain square shape */
    }

    .intro-text-container {
      flex: 0 0 60%; /* Takes 60% of width (leaving 5% for gap) */
      max-width: 60%;
      align-self: center; /* Center vertically within flex container */
    }
    
    .name-heading {
      font-size: 3.5rem;
      text-align: left;
    }

    .subtitle {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .tagline-text {
      font-size: 1.4rem;
      text-align: left;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .tagline-container {
      margin-bottom: 2.5rem;
    }

    .actions-container {
      justify-content: flex-start;
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
  @media (min-width: 1300px) {
    .top-section {
      padding: 5rem 3rem; /* Reduced bottom padding */
      gap: 6rem;
      min-height: 90vh;
    }

    .avatar-container {
      align-self: center;
      flex: 0 0 40%;
      max-width: 450px;
      height: 450px;
    }
    
    .intro-text-container {
      flex: 0 0 60%;
      padding-left: 3rem;
    }

    .name-heading {
      font-size: 5.5rem; /* Increased font size for desktop */
    }

    .subtitle {
      font-size: 5rem; /* Increased font size for desktop */
    }

    .tagline-text {
      font-size: 1.5rem;
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