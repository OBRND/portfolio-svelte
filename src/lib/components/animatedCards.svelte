<script>
    import { onMount } from 'svelte';
    
    // Props with defaults
    export let title = '';
    export let description = '';
    export let logo = '';
    export let link = '';
    export let buttonText = 'Read now';
    export let animationColor = '#ff6b35';
    export let buttonColor = 'white';
    export let shapeType = 'circle'; // 'circle', 'wave', 'blob', 'curve1', 'curve2', 'curve3', 'curve4'
    
    // Internal state
    let isHovered = false;
    let cardElement;
    
    // Handle mouse events
    function handleMouseEnter() {
      isHovered = true;
    }
    
    function handleMouseLeave() {
      isHovered = false;
    }
    
    function handleClick() {
      if (link) {
        window.location.href = link;
      }
    }
  </script>
  
  <div 
    class="animated-card"
    class:is-hovered={isHovered}
    bind:this={cardElement}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:click={handleClick}
  >
    <!-- Card content -->
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
        
        <slot></slot>
      </div>
    </div>
    
    <!-- SVG background animation -->
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
    
    <!-- Button -->
    <div class="button-container">
      <a href={link} class="card-button">
        {buttonText}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </a>
    </div>
  </div>
  
  <style>
    .animated-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      background-color: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      height: 100%;
      min-width: 300px;
      min-height: 300px;
      max-height: 350px;
      display: flex;
      flex-direction: column;
      border: 1px solid #eaeaea;
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
      font-size: clamp(1rem, 3rem, 4rem); /* Example: min 1rem, preferred 3vw, max 1.5rem */
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: #333;
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
      transform: translateY(60%); /* Show only top portion initially */
      transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    /* Shape-specific adjustments */
    .svg-container.circle svg {
      transform: translate(-25%, 55%) scale(.65);
    }
    
    .svg-container.wave svg {
      transform: translate(-40%, 0%) scale(1);
    }
    
    .svg-container.blob svg {
      transform: translate(-40%, 0%) scale(1.2);
    }
    
    /* New shape adjustments */
  
    .svg-container.tree svg {
      transform: translate(-5%, -20%) scale(3) rotate(230deg);
    }
    
    .svg-container.triangle svg {
      transform: translate(-15%, 145%) scale(2.2) rotate(45deg);
    }
    
    .svg-container.hexagon svg {
      transform: translate(5%, 10%) scale(2.2) rotate(260deg);
    }
    
    /* On hover, move to cover the entire card with a curved motion */
    .is-hovered .svg-container.blob svg {
      transform: translate(-65%, -250%) scale(6) rotate(10deg);
    }
    
    .is-hovered .svg-container.wave svg {
      transform: translate(0%, -235%) scale(6) rotate(10deg);
    }
    
    .is-hovered .svg-container.circle svg {
      transform: translate(0%, -20%) scale(2) rotate(-45deg);
    }
    
    .is-hovered .svg-container.tree svg {
      transform: translate(115%, -250%) scale(10) rotate(260deg);
    }
    
    .is-hovered .svg-container.triangle svg {
      transform: translate(40%, 210%) scale(6) rotate(40deg);
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
      text-decoration: none;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.3s ease;
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
  </style>