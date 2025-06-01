<script lang="ts">
  // Import the image asset
  import vanItScreenshot from '$lib/assets/van_it_.webp';

  // Define project data
  const projects = [
    {
      name: 'Van It',
      screenshot: vanItScreenshot, // Use the imported image
      tags: ['Delivery', 'Logistics', 'Localization', 'Real-Time Tracking'],
      technologies: ['Flutter', 'Firebase', 'OpenStreetMap (OSM) API'],
      description: 'A feature-rich packing and delivery app designed to simplify scheduling and ord...',
      detailsLink: '/projects/van-it-details' // Link to a detailed page if needed
    },
    // You can add more projects here following the same structure
    {
      name: 'Another App',
      screenshot: vanItScreenshot,
      tags: ['Finance', 'Budgeting'],
      technologies: ['React Native', 'Node.js'],
      description: 'A personal finance tracker with intuitive budgeting tools.',
      detailsLink: '/projects/van-it-details'
    }
  ];
</script>

<div class="projects-page-container">
  <section class="projects-header-section">
    <div class="section-content-wrapper">
      <h1 class="section-title centered-title">MY PROJECTS</h1>
    </div>
  </section>

  <section class="project-list-section">
    <div class="section-content-wrapper">
      {#each projects as project, index}
        <div class="project-card {index % 2 === 0 ? 'even-project' : 'odd-project'}">
          <div class="project-screenshot-container">
            <div class="project-screenshot-inner"> <img src={project.screenshot} alt="{project.name} App Screenshot" class="project-screenshot" />
            </div>
          </div>
          <div class="project-details">
            <h2 class="project-name">{project.name}</h2>

            <div class="details-group">
              <h3 class="group-title">Tags</h3>
              <div class="tag-list">
                {#each project.tags as tag}
                  <span class="tag-item">{tag}</span>
                {/each}
              </div>
            </div>

            <div class="details-group">
              <h3 class="group-title">Technologies</h3>
              <div class="tech-list">
                {#each project.technologies as tech}
                  <span class="tech-item">{tech}</span>
                {/each}
              </div>
            </div>

            <div class="details-group">
              <h3 class="group-title">Description</h3>
              <p class="project-description">{project.description}</p>
            </div>

            <a href={project.detailsLink} class="details-button">
              Click to view Details <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  /* Define CSS variables for consistency */
  :root {
      --text-dark: #2c3e50;
      --text-medium: #555;
      --bg-light-purple: #f8f4fa;
      --bg-white: #ffffff;
      --svelte-orange: #FF3E00; /* For title underline */
      --border-light: #e0e0e0;
      --tag-bg: #f0f0f0;
      --tag-text: #666;
      --image-padding: 1.5rem; /* Padding for the image inside its container */
      --shadow-color: rgba(0, 0, 0, 0.25); /* Stronger shadow for physical effect */
  }

  .projects-page-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    width: 100%;
    overflow-x: hidden;
    color: var(--text-dark);
    line-height: 1.6;
    background-color: var(--bg-light-purple);
  }

  .section-content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem; /* Horizontal padding */
      box-sizing: border-box;
  }

  /* Header Section Styling (similar to ToolkitSection) */
  .projects-header-section {
    padding-top: 2rem; /* Reduced space above the main header */
    padding-bottom: 1rem; /* Reduced space below the main header */
    background-color: var(--bg-light-purple);
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--text-dark);
    text-align: center;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 0.5rem;
  }

  .centered-title {
    font-size: 1.3rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
    color: var(--text-dark);
    position: relative;
    display: block;
    margin: 0 auto 1.5rem auto;
    padding-bottom: 0.5rem;
    width: fit-content;
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

  /* Project List Section */
  .project-list-section {
    padding: 1.5rem 0 3rem 0; /* Reduced vertical padding for the list */
    background-color: var(--bg-light-purple);
  }

  .project-card {
    background-color: transparent; /* Card itself is transparent */
    border-radius: 12px; /* Overall card border-radius */
    box-shadow: none; /* No shadow on the main card */
    margin-bottom: 2.5rem; /* Reduced space between project cards */
    overflow: hidden; /* Ensures content respects border-radius */
    display: flex;
    flex-direction: column; /* Stack on mobile */
    align-items: stretch; /* Stretch children to fill width */
  }

  .project-screenshot-container {
    position: relative; /* For the pseudo-element fade */
    width: 100%;
    height: 250px; /* Fixed height for the visible upper portion on mobile */
    overflow: hidden; /* Crucial to show only the upper part */
    display: flex;
    justify-content: center;
    align-items: center; /* Center the inner content */
    border-radius: 12px 12px 0 0; /* Rounded top corners for mobile */
    /* Shadow applied here */
    box-shadow: 0 10px 20px var(--shadow-color);
  }

  .project-screenshot-container::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px; /* Height of the fade effect */
      background: linear-gradient(to top, var(--bg-light-purple), transparent); /* Fade to page background color */
      pointer-events: none; /* Allows interactions to pass through */
  }

  .project-screenshot-inner { /* New inner container for padding/squeeze */
      position: absolute;
      top: var(--image-padding);
      left: var(--image-padding);
      right: var(--image-padding);
      bottom: var(--image-padding);
      overflow: hidden; /* Clips the image within this padded area */
      border-radius: 8px; /* Slightly smaller radius for inner image */
      display: flex; /* To center the image inside */
      justify-content: center;
      align-items: center;
  }

  .project-screenshot {
    width: 100%;
    height: 100%; /* Make image fill the inner container's height */
    display: block;
    object-fit: cover; /* Ensures image covers the container, might crop sides */
    object-position: top; /* Ensures the top part of the image is visible */
  }

  .project-details {
    width: 100%;
    background-color: var(--bg-white); /* White background for details section */
    box-shadow: none; /* No shadow on details section */
    border-radius: 0 0 12px 12px; /* Rounded bottom corners for mobile */
    padding: 1.5rem; /* Padding inside the details section */
    box-sizing: border-box;
    text-align: center; /* Center text on mobile */
    flex-grow: 1; /* Allow details to grow if needed */
  }

  .project-name {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: var(--text-dark);
    background: linear-gradient(45deg, #02569B, #FF3E00); /* Flutter Blue to Svelte Orange */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    line-height: 1.1;
  }

  .details-group {
    margin-bottom: 1.5rem; /* Space between detail groups */
    text-align: left; /* Align detail content to left */
  }

  .group-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tag-list, .tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag-item, .tech-item {
    background-color: var(--tag-bg);
    color: var(--tag-text);
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .project-description {
    font-size: 0.95rem;
    color: var(--text-medium);
    margin-top: 0.5rem;
    line-height: 1.5;
  }

  .details-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--svelte-orange);
    color: var(--bg-white);
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: background-color 0.3s ease, transform 0.2s ease;
    margin-top: 1.5rem; /* Space above the button */
  }

  .details-button:hover {
    background-color: #e63900; /* Darker orange on hover */
    transform: translateY(-2px);
  }

  /* Responsive adjustments */
  @media (min-width: 768px) {
    .projects-header-section {
        padding-top: 3rem; /* Adjusted padding */
        padding-bottom: 1.5rem; /* Adjusted padding */
    }
    .centered-title {
        font-size: 1.5rem;
        margin-bottom: 1.5rem; /* Adjusted margin */
    }

    .project-list-section {
      padding: 2.5rem 0 4rem 0; /* Adjusted padding */
    }

    .project-card {
      flex-direction: row; /* Side-by-side on tablet/desktop */
      margin-bottom: 3.5rem; /* Adjusted margin */
      padding-bottom: 0; /* Reset padding for row layout */
      /* No overall box-shadow here, it's on the image container */
    }

    .project-card.odd-project {
        flex-direction: row-reverse; /* Reverse order for odd cards */
    }

    .project-screenshot-container {
      width: 40%; /* Take 40% width as requested */
      height: 00px; /* Fixed height for desktop to ensure consistent clipping */
      border-radius: 12px 0 0 12px; /* Rounded left corners for even cards */
      /* Removed border-right as the shadow will define the edge */
      box-shadow: 0 10px 20px var(--shadow-color); /* Shadow only on the image container */
    }
    .project-card.odd-project .project-screenshot-container {
        border-radius: 0 12px 12px 0; /* Rounded right corners for odd cards */
        /* Removed border-left as the shadow will define the edge */
    }

    .project-details {
      width: 60%; /* Take remaining 60% width */
      padding: 2rem; /* Increased padding */
      text-align: left; /* Align text left */
      border-radius: 0 12px 12px 0; /* Rounded right corners for even cards */
      box-shadow: none; /* Ensure no shadow on details section */
    }
    .project-card.odd-project .project-details {
        border-radius: 12px 0 0 12px; /* Rounded left corners for odd cards */
    }

    .project-name {
      font-size: 2.5rem;
    }
  }

  @media (min-width: 1024px) {
    .projects-header-section {
        padding-top: 4rem; /* Adjusted padding */
        padding-bottom: 2rem; /* Adjusted padding */
    }
    .centered-title {
        font-size: 1.8rem;
        margin-bottom: 2rem; /* Adjusted margin */
    }

    .project-list-section {
      padding: 3.5rem 0 5rem 0; /* Adjusted padding */
    }

    .project-card {
      margin-bottom: 4.5rem; /* Adjusted margin */
    }

    .project-details {
      padding: 2.5rem;
    }

    .project-name {
      font-size: 3rem;
    }
    .group-title {
      font-size: 1.1rem;
    }
    .project-description {
      font-size: 1rem;
    }
    .details-button {
      font-size: 1rem;
    }
  }

  @media (min-width: 1400px) {
    .section-content-wrapper {
        max-width: 1300px;
    }
  }
</style>
