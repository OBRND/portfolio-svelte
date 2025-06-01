<script lang="ts">
import AnimatedCard from '$lib/components/animatedCards.svelte';

  // Define the card data based on the screenshot content
  const servicesCards = [
    {
      title: 'Cross Platform Development',
      description: 'Using Flutter, your Ideas reach the world.',
      imageUrl: '/placeholder.svg?height=200&width=400', // Placeholder, replace with actual image if available
      link: '/services/cross-platform',
      buttonText: 'Know about more',
      animationColor: '#4285F4', // Blue, inspired by Flutter
      shapeType: 'blob'
    },
    {
      title: 'UI/UX Design',
      description: 'Craft beautiful and intuitive user experiences.',
      imageUrl: '/placeholder.svg?height=200&width=400',
      link: '/services/ui-ux',
      buttonText: 'Know about more',
      animationColor: '#34A853', // Green
      shapeType: 'circle'
    },
    {
      title: 'Deployment Services',
      description: 'Seamlessly launch your apps, from concept to app stores.',
      imageUrl: '/placeholder.svg?height=200&width=400',
      link: '/services/deployment',
      buttonText: 'Know about more',
      animationColor: '#FBBC05', // Orange
      shapeType: 'wave'
    },
    {
      title: 'Web Development',
      description: 'Build dynamic and engaging web experiences that shine.',
      imageUrl: '/placeholder.svg?height=200&width=400',
      link: '/services/web-dev',
      buttonText: 'Know about more',
      animationColor: '#EA4335', // Red
      shapeType: 'hexagon'
    },
    {
      title: 'Backend Development',
      description: 'Node.js & MongoDB: Power your apps with robust cloud storage.',
      imageUrl: '/placeholder.svg?height=200&width=400',
      link: '/services/backend-dev',
      buttonText: 'Know about more',
      animationColor: '#9C27B0', // Purple
      shapeType: 'triangle'
    },
    {
      title: 'Consulting & Strategy', // Added a 6th service as only 5 were in screenshot
      description: 'Expert guidance to navigate your digital journey and achieve your goals.',
      imageUrl: '/placeholder.svg?height=200&width=400',
      link: '/services/consulting',
      buttonText: 'Know about more',
      animationColor: '#00BCD4', // Cyan
      shapeType: 'tree'
    }
  ];

  // Dummy event handlers for AnimatedCard (as provided in your example)
  function handleCardClick(card: any) {
    console.log('Card clicked:', card.title);
    // Implement actual navigation or logic here
  }

  function handleAnimationComplete(event: CustomEvent, card: any) {
    console.log('Animation complete for:', card.title, event.detail);
  }
</script>

<div class="services-page-section">
  <section class="services-main-header-section">
    <div class="section-content-wrapper">
      <h2 class="section-title centered-title">MY SERVICES</h2>
    </div>
  </section>

  <section class="services-grid-section">
    <div class="section-content-wrapper">
      <div class="card-grid">
        {#each servicesCards as card, index}
          <AnimatedCard
            title={card.title}
            description={card.description}
            imageUrl={card.imageUrl}
            link={card.link}
            buttonText={card.buttonText}
            animationColor={card.animationColor}
            buttonColor="white"
            animationTrigger="hover"
            darkModeSupport={true}
            shapeType={card.shapeType}
            on:click={() => handleCardClick(card)}
            on:animationComplete={(event) => handleAnimationComplete(event, card)}
          />
        {/each}
      </div>
    </div>
  </section>
</div>

<style>
  /* Define CSS variables for consistency */
  :root {
      --text-dark: #2c3e50;
      --bg-light-purple: #f8f4fa;
      --bg-white: #ffffff;
      --card-border-radius: 12px;
      --svelte-orange: #FF3E00; /* Added Svelte orange for underline */
  }

  /* Base styles for the new component */
  .services-page-section {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    width: 100%;
    overflow-x: hidden;
    color: var(--text-dark);
    line-height: 1.6;
    padding: 0;
    background-color: var(--bg-light-purple); /* Overall background for the services page */
  }

  .section-content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem; /* Horizontal padding for content */
      box-sizing: border-box;
  }

  /* Main Services Header Section */
  .services-main-header-section {
      padding-top: 2rem; /* Reduced space above the main header */
      padding-bottom: 1rem; /* Reduced space below the main header */
      background-color: var(--bg-light-purple); /* Consistent with toolkit header background */
  }

  /* Common section title styles */
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

  /* Specific style for centered titles with underline (copied from ToolkitSection's .centered-title) */
  .centered-title {
    font-size: 1.3rem; /* Smaller, like "ABOUT ME" and "MY TOOLKITS" */
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1.5rem; /* Reduced space below title */
    color: var(--text-dark);
    position: relative;
    display: block; /* Changed to block for margin auto centering */
    margin: 0 auto 1.5rem auto; /* Centered with margin-auto, and bottom margin */
    padding-bottom: 0.5rem;
    width: fit-content; /* Ensure it wraps content for centering */
  }

  .centered-title::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background-color: var(--svelte-orange); /* Using Svelte orange for consistency */
      border-radius: 2px;
  }

  /* Services Grid Section */
  .services-grid-section {
    padding: 1.5rem 0 3rem 0; /* Reduced padding around the grid */
    background-color: var(--bg-light-purple); /* Consistent background */
  }

  .card-grid {
    display: grid;
    /* On mobile, allow cards to wrap, but ensure a minimum size */
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem; /* Consistent gap between cards */
    justify-content: center; /* Center grid items if they don't fill the row */
    max-width: 100%; /* Allow grid to take full wrapper width */
  }

  /* Responsive adjustments */

  /* Tablet (>= 768px) */
  @media (min-width: 768px) {
    .section-content-wrapper {
          padding: 0 2rem;
     }

    .services-main-header-section {
        padding-top: 3rem; /* Adjusted padding */
        padding-bottom: 1.5rem; /* Adjusted padding */
    }
    .centered-title {
        font-size: 1.5rem;
        margin-bottom: 2rem; /* Adjusted margin */
    }

    .services-grid-section {
        padding: 2.5rem 0; /* Adjusted padding */
    }
    .card-grid {
        grid-template-columns: repeat(2, 1fr); /* 2 columns on tablet */
        gap: 2.5rem; /* Adjusted gap */
    }
  }

  /* Desktop (>= 1024px) */
  @media (min-width: 1024px) {
       .section-content-wrapper {
            padding: 0 3rem;
       }

      .services-main-header-section {
          padding-top: 4rem; /* Adjusted padding */
          padding-bottom: 2rem; /* Adjusted padding */
      }
      .centered-title {
          font-size: 1.8rem;
          margin-bottom: 2.5rem; /* Adjusted margin */
      }

      .services-grid-section {
          padding: 3.5rem 0; /* Adjusted padding */
      }
      .card-grid {
          grid-template-columns: repeat(3, 1fr); /* Fixed 3 columns on desktop */
          gap: 3rem; /* Adjusted gap */
      }
  }

   /* Adjust content wrapper max-width for extra large screens */
   @media (min-width: 1400px) {
       .section-content-wrapper {
           max-width: 1300px;
       }
   }
</style>
