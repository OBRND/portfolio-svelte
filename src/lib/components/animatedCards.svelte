<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { onMount } from 'svelte';

  // Props with defaults using Svelte 5 syntax
  let {
    title = '',
    description = '',
    logo = '',
    link = '',
    buttonText = 'Read now',
    animationColor = '#ff6b35',
    buttonColor = 'white',
    shapeType = 'circle',
    modalData = null
  } = $props();

  // Internal state
  let isHovered = $state(false);
  let isModalOpen = $state(false);
  let cardElement;
  let modalContainer;

  onMount(() => {
    document.body.appendChild(modalContainer);
    return () => {
      if (modalContainer.parentNode) {
        document.body.removeChild(modalContainer);
      }
    };
  });

  // Handle mouse events
  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
  }

  function handleClick(event: Event) { // Added event type for clarity
    event.preventDefault();
    isModalOpen = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  // Modal functions
  function closeModal() {
    isModalOpen = false;
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  function handleKeydown(event: KeyboardEvent) { // Added event type for clarity
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  function handleBackdropClick(event: MouseEvent) { // Added event type for clarity
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
</script>

<div
  class="animated-card"
  class:is-hovered={isHovered}
  bind:this={cardElement}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onclick={handleClick}
  role="button"
  tabindex="0"
  onkeydown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick(event);
    }
  }}
  style="--animation-card-border-color: {animationColor};"
>
  <div class="card-content">
    {#if logo}
      <div class="card-logo">
        <img src={logo || "/placeholder.svg"} alt="Logo" />
      </div>
    {/if}

    <div class="card-body">
      {#if title}
        <h2 class="card-title">{title}</h2>
      {/if}

      {#if description}
        <p class="card-description">{description}</p>
      {/if}
    </div>
  </div>

  <div class="svg-container {shapeType}">
    {#if shapeType === 'circle'}
      <svg viewBox="0 0 200 200" preserveAspectRatio="none">
        <circle cx="100" cy="100" r="100" fill={animationColor} />
      </svg>
    {:else if shapeType === 'wave'}
      <svg viewBox="0 0 200 200" preserveAspectRatio="none">
        <path d="M0,200 C50,120 150,120 200,200 L200,200 L0,200 Z" fill={animationColor} />
      </svg>
    {:else if shapeType === 'blob'}
      <svg viewBox="0 0 200 200" preserveAspectRatio="none">
        <path d="M0,200 C30,150 70,180 100,150 C130,120 170,150 200,200 L200,200 L0,200 Z" fill={animationColor} />
      </svg>
    {:else if shapeType === 'tree'}
      <svg viewBox="0 0 200 200" preserveAspectRatio="none">
        <path d="M50,0
        C65,0 85,15 85,35
        C85,55 65,70 50,70
        C35,70 15,55 15,35
        C15,15 35,0 50,0
        M50,0
        C60,-15 80,-15 85,0
        C110,10 110,35 85,35
        C110,45 110,70 85,70
        C80,85 60,85 50,70"
      fill={animationColor} />
      </svg>
    {:else if shapeType === 'triangle'}
      <svg viewBox="0 0 200 200" preserveAspectRatio="none">
        <path d="M50,10
        Q56,10 59,15
        L90,75
        Q93,80 88,85
        L12,85
        Q7,80 10,75
        L41,15
        Q44,10 50,10 Z"

        fill={animationColor} />
      </svg>
    {:else if shapeType === 'hexagon'}
      <svg viewBox="0 0 200 200" preserveAspectRatio="none">
        <path d="M30,10
        Q42,-2 54,10
        L74,10
        Q86,10 92,22
        L100,40
        Q106,52 100,64
        L92,82
        Q86,94 74,94
        L54,94
        Q42,106 30,94
        L16,64
        Q10,52 16,40
        L24,22
        Q30,10 30,10 Z"

      fill={animationColor} />
      </svg>
    {/if}
  </div>

  <div class="button-container">
    <button class="card-button" onclick={handleClick}>
      {buttonText}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  </div>
</div>
<div bind:this={modalContainer} style="position: fixed; z-index: 1000; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
  {#if isModalOpen && modalData}
    <div
      class="modal-backdrop"
      transition:fade={{ duration: 300 }}
      onclick={closeModal}
      onkeydown={handleKeydown}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      style="pointer-events: all;"
    >
      <div
        class="modal-dialog"
        transition:scale={{ duration: 400, start: 0.9 }}
        onclick={closeModal}
      >
      <div class="modal-header" style="--service-color: {animationColor}">
        <div class="service-icon">{modalData.icon}</div>
        <div class="header-text">
          <h2>{modalData.title}</h2>
          <p>{modalData.subtitle}</p>
        </div>
        <button class="close-btn" onclick={closeModal} aria-label="Close modal">×</button>
      </div>

      <div class="modal-body">
        <p class="description">{modalData.description}</p>

        {#if modalData.tools}
          <div class="section">
            <h3>🛠️ Key Tools & Technologies</h3>
            <ul>
              {#each modalData.tools as tool}
                <li>{tool}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if modalData.philosophy}
          <div class="section">
            <h3>💡 Design Philosophy</h3>
            <ul>
              {#each modalData.philosophy as principle}
                <li>{principle}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if modalData.services}
          <div class="section">
            <h3>✅ What I Handle</h3>
            <ul>
              {#each modalData.services as serviceItem}
                <li>{serviceItem}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if modalData.offerings}
          <div class="section">
            <h3>⭐ What I Offer</h3>
            <ul>
              {#each modalData.offerings as offering}
                <li>{offering}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
{/if}
</div>
<style>
  .animated-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--bg-primary);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    height: 105%;
    width: 370px;
    min-width: 370px;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    border: 2px solid var(--animation-card-border-color); /* <-- Corrected line */
    padding: 2rem;
  }

  .card-content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-logo {
    margin-bottom: 2rem;
    max-width: 150px;
    height: 40px;
  }

  .card-logo img {
    max-height: 100%;
    width: auto;
  }

  .card-title {
    font-size: clamp(1rem, 3rem, 4rem);
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    transition: color 0.3s ease;
  }

  .card-description {
    font-size: 1.25rem;
    line-height: 1.5;
    color: #555;
    margin: 0 0 2rem 0;
    transition: color 0.3s ease;
  }

  /* SVG Animation - Base */
  .svg-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
  }

  .svg-container svg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70%;
    transform: translateY(60%);
    transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Shape-specific adjustments */
  .svg-container.circle svg {
    transform: translate(-24%, 45%) scale(.65);
  }

  .svg-container.wave svg {
    transform: translate(-32%, -9%) scale(1.2);
  }

  .svg-container.blob svg {
    transform: translate(-40%, -5%) scale(1.2);
  }

  .svg-container.tree svg {
    transform: translate(-30%, -35%) scale(3) rotate(210deg);
  }

  .svg-container.triangle svg {
    transform: translate(0%, 155%) scale(2.2) rotate(45deg);
  }

  .svg-container.hexagon svg {
    transform: translate(20%, 5%) scale(3.2) rotate(260deg);
  }

  /* On hover, move to cover the entire card with a curved motion */
  .is-hovered .svg-container.blob svg {
    transform: translate(-65%, -250%) scale(6) rotate(10deg);
  }

  .is-hovered .svg-container.wave svg {
    transform: translate(0%, -235%) scale(6) rotate(10deg);
  }

  .is-hovered .svg-container.circle svg {
    transform: translate(0%, -20%) scale(2.3) rotate(-45deg);
  }

  .is-hovered .svg-container.tree svg {
    transform: translate(115%, -250%) scale(10) rotate(260deg);
  }

  .is-hovered .svg-container.triangle svg {
    transform: translate(60%, 260%) scale(6) rotate(40deg);
  }

  .is-hovered .svg-container.hexagon svg {
    transform: translate(90%, 80%) scale(5) rotate(350deg);
  }

  /* Button */
  .button-container {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    z-index: 3;
  }

  .card-button {
    font-size: 1rem;
    font-weight: 500;
    background: none;
    border: none;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.3s ease;
    cursor: pointer;
    padding: 0;
  }

  .card-button:hover {
    transform: translateX(5px);
  }

  .arrow-icon {
    transition: transform 0.3s ease;
  }

  .card-button:hover .arrow-icon {
    transform: translateX(3px);
  }

  /* Text color change on hover */
  .is-hovered .card-title,
  .is-hovered .card-description {
    color: white;
  }

  /* Modal Styles - positioned relative to the services section */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  .modal-dialog {
    background: var(--bg-secondary, white);
    border-radius: 16px;
    width: min(700px, 90vw);
    max-height: min(80vh, 100vh - 2rem);
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    background: linear-gradient(135deg, var(--service-color), color-mix(in srgb, var(--service-color) 80%, #000));
    color: white;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .service-icon {
    font-size: 2rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .header-text {
    flex: 1;
  }

  .header-text h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .header-text p {
    margin: 0;
    opacity: 0.9;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .modal-body {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
  }

  .description {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    color: var(--text-color, #333);
  }

  .section {
    margin-bottom: 2rem;
  }

  .section h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--text-color, #333);
  }

  .section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .section li {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    position: relative;
    padding-left: 1.5rem;
    color: var(--text-color, #555);
  }

  .section li:before {
    content: '•';
    color: var(--svelte-orange, #ff3e00);
    font-weight: bold;
    position: absolute;
    left: 0;
  }

  .section li:last-child {
    border-bottom: none;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .modal-backdrop {
      padding: 0.5rem;
    }

    .modal-header {
      padding: 1.5rem;
    }

    .service-icon {
      font-size: 1.5rem;
    }

    .header-text h2 {
      font-size: 1.3rem;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-dialog {
      max-height: 85vh;
    }
  }

  /* Dark mode support */
  :global(.dark) .modal-dialog {
    background: var(--bg-secondary);
  }

  :global(.dark) .section li {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>