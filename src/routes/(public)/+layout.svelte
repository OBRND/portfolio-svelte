<script>
import '../../app.css';  
import '$lib/themes'; // subscribe immediately
import Toggle from '$lib/components/ThemeToggle.svelte'; // import theme toggle component
import { onMount } from 'svelte';
import { browser } from '$app/environment';

let scrollY = 0;
let innerHeight = 0;
let documentHeight = 0;
let activeSection = 'about'; // Track active section

// Smooth scroll function
function scrollToSection(id) {
  if (!browser) return;
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Function to determine active section based on scroll position
function updateActiveSection() {
  if (!browser) return; // Guard against SSR
  
  const sections = ['about', 'skills', 'projects', 'contact'];
  const offset = 100; // Offset for navbar height
  
  for (let i = sections.length - 1; i >= 0; i--) {
    const element = document.getElementById(sections[i]);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= offset) {
        activeSection = sections[i];
        break;
      }
    }
  }
}

// Calculate main content slide progress with proper constraints
$: {
  const maxScroll = documentHeight - innerHeight;
  const footerHeight = innerHeight >= 768 ? 320 : (innerHeight >= 480 ? 280 : 260);
  const slideStart = maxScroll - 200;
  const maxSlideDistance = footerHeight;
  const scrollProgress = Math.max(0, Math.min(1, (scrollY - slideStart) / 200));
  mainSlideProgress = scrollProgress;
  maxSlidePixels = maxSlideDistance;
}

$: navbarScrolled = scrollY > 50;
$: mainSlideProgress = 0;
$: maxSlidePixels = 320;

// Update active section on scroll - only in browser
$: if (browser && scrollY >= 0) {
  updateActiveSection();
}

onMount(() => {
  const updateDocumentHeight = () => {
    documentHeight = document.documentElement.scrollHeight;
  };
  
  updateDocumentHeight();
  
  // Update on resize and content changes
  const resizeObserver = new ResizeObserver(updateDocumentHeight);
  resizeObserver.observe(document.body);
  
  return () => {
    resizeObserver.disconnect();
  };
});
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div class="app">
  <!-- Footer positioned behind everything with proper height constraints -->
  <footer class="background-footer">
    <div class="footer-background"></div>
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <h2>Portfolio</h2>
          <div class="contact-social-container">
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-label">Email:</span>
                <a href="mailto:obsannew@gmail.com" class="contact-value">obsannew@gmail.com</a>
              </div>
              <div class="contact-item">
                <span class="contact-label">Phone:</span>
                <a href="tel:+251940844097" class="contact-value">+251 (940) 844 097</a>
              </div>
              <div class="contact-item">
                <span class="contact-label">Address:</span>
                <span class="contact-value address">Addis Ababa, Ethiopia</span>
              </div>
            </div>
            
            <div class="social-section">
              <div class="social-links">
                <a href="https://github.com/OBRND" target="_blank" rel="noopener noreferrer" title="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://t.me/OBDREAMER" target="_blank" rel="noopener noreferrer" title="Telegram">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a href="mailto:obsannew@gmail.com" title="Gmail">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                </a>
                <a href="sms:+251940844097" title="SMS">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                </a>
                <a href="tel:+251940844097" title="Phone">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>© {new Date().getFullYear()} Portfolio. All rights reserved.</p>
        </div>
        <div class="footer-tech">
          <span class="made-with">Made with <span class="svelte-text">Svelte</span></span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Main content that slides up with proper constraints -->
  <div class="sliding-content" style="transform: translateY({-mainSlideProgress * maxSlidePixels}px)">
    <header class="navbar" class:scrolled={navbarScrolled}>
      <nav>
        <ul>
          <li>
            <a 
              href="#about" 
              class:active={activeSection === 'about'}
              on:click|preventDefault={() => scrollToSection('about')}
            >
              About
            </a>
          </li>
          <li>
            <a 
              href="#skills" 
              class:active={activeSection === 'skills'}
              on:click|preventDefault={() => scrollToSection('skills')}
            >
              Skills
            </a>
          </li>
          <li>
            <a 
              href="#projects" 
              class:active={activeSection === 'projects'}
              on:click|preventDefault={() => scrollToSection('projects')}
            >
              Projects
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              class:active={activeSection === 'contact'}
              on:click|preventDefault={() => scrollToSection('contact')}
            >
              Contact
            </a>
          </li>
          <li class="theme-toggle"><Toggle/></li>
        </ul>
      </nav>
    </header>

    <main class="main-content">
      <slot />
    </main>
  </div>
</div>

<style>
  .app {
    position: relative;
    min-height: 100vh;
  }

  /* Footer positioned behind everything with proper height constraints */
  .background-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 320px; /* Fixed height for desktop */
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .footer-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* Modern tech background with circuit patterns and orange accents */
    background-image: url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2125&q=80'),
                      linear-gradient(45deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 69, 0, 0.05) 100%);
    background-size: cover, cover;
    background-position: center, center;
    background-attachment: fixed, fixed;
    background-blend-mode: overlay;
  }

  .footer-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(255, 140, 0, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.2) 0%, transparent 50%),
      linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
  }

  .footer-content {
    position: relative;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.75) 100%
    );
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    color: white;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    height: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  /* Main content that slides up - NO EXTRA PADDING */
  .sliding-content {
    position: relative;
    z-index: 10;
    background: var(--bg-color, #ffffff);
    min-height: 100vh;
  }

  /* Glossy/Blurred Navbar with size transitions and active indicators */
  .navbar {
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    z-index: 100;
    padding: 1.5rem 1rem;
    transition: all 0.3s ease;
  }

  .navbar.scrolled {
    padding: 0.8rem 1rem;
  }

  /* Dark mode navbar adjustments */
  :global(.dark) .navbar {
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  nav ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    justify-content: center;
    align-items: center;
    gap: 2.5rem;
    transition: all 0.3s ease;
  }

  .navbar.scrolled nav ul {
    gap: 2rem;
  }

  nav a {
    text-decoration: none;
    color: var(--text-color, #333);
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    position: relative;
    font-size: 1rem;
  }

  .navbar.scrolled nav a {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  nav a:hover {
    color: #0070f3;
    background: rgba(0, 112, 243, 0.1);
  }

  /* Active navigation indicator */
  nav a.active {
    color: #0070f3;
  }

  nav a.active::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: #0070f3;
    border-radius: 1px;
    transition: all 0.3s ease;
  }

  .navbar.scrolled nav a.active::after {
    bottom: -0.3rem;
    width: 16px;
  }

  .theme-toggle {
    transition: all 0.3s ease;
  }

  /* Main content */
  .main-content {
    position: relative;
    min-height: 100vh;
  }

  /* Footer Layout - Desktop remains the same */
  .footer-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    flex: 1;
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
  }

  .footer-brand h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
    color: white;
  }

  /* Contact and Social Container for mobile optimization */
  .contact-social-container {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  .contact-info {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    flex: 1;
  }

  .contact-item {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .contact-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .contact-value {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
    font-size: 0.9rem;
  }

  .contact-value:hover {
    color: #0070f3;
  }

  .contact-value.address {
    cursor: default;
  }

  .contact-value.address:hover {
    color: white;
  }

  .social-section {
    display: flex;
    align-items: flex-start;
  }

  .social-links {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
  }

  .social-links a {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
    text-decoration: none;
  }

  .social-links a:hover {
    background: rgba(255, 140, 0, 0.3);
    transform: translateY(-2px);
  }

  .social-links svg {
    width: 22px;
    height: 22px;
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .footer-copyright p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .made-with {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .svelte-text {
    color: #ff3e00;
    font-weight: 600;
    text-shadow: 0 0 10px rgba(255, 62, 0, 0.3);
  }

  /* Responsive Design with mobile space optimization */
  @media (max-width: 768px) {
    .background-footer {
      height: 280px;
    }

    nav ul {
      gap: 1.2rem; /* Slightly reduced from 1.5rem */
      flex-wrap: wrap;
    }

    .navbar.scrolled nav ul {
      gap: 1rem;
    }

    .footer-content {
      padding: 1.5rem;
    }

    .footer-main {
      flex-direction: column;
      gap: 1rem;
    }

    .footer-brand {
      gap: 1rem;
      width: 100%;
    }

    .footer-brand h2 {
      font-size: 1.5rem;
    }

    /* Keep contact and social side by side on tablet */
    .contact-social-container {
      flex-direction: row;
      gap: 1.5rem;
    }

    .contact-info {
      flex-direction: column;
      gap: 0.8rem;
    }

    .social-links {
      flex-direction: row;
      gap: 0.6rem;
    }

    .footer-bottom {
      flex-direction: column;
      gap: 0.8rem;
      text-align: center;
      padding-top: 1rem;
    }
  }

  @media (max-width: 480px) {
    .background-footer {
      height: 260px; /* Reduced height for better mobile fit */
    }

    nav ul {
      gap: 0.8rem; /* Reduced from 1rem for tighter mobile spacing */
    }

    .navbar.scrolled nav ul {
      gap: 0.5rem;
    }

    nav a {
      padding: 0.4rem 0.6rem; /* Reduced padding for tighter fit */
      font-size: 0.85rem; /* Slightly smaller font */
    }

    .navbar.scrolled nav a {
      padding: 0.3rem 0.5rem;
      font-size: 0.8rem;
    }

    .footer-content {
      padding: 1rem;
    }

    .footer-brand h2 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }

    /* Mobile: 50/50 split with proper spacing */
    .contact-social-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      width: 100%;
    }

    .contact-info {
      flex-direction: column;
      gap: 0.6rem;
      flex: 0 0 48%; /* Takes exactly 48% of width */
    }

    .contact-item {
      gap: 0.2rem;
    }

    .contact-label {
      font-size: 0.7rem;
    }

    .contact-value {
      font-size: 0.8rem;
    }

    .social-section {
      flex: 0 0 48%; /* Takes exactly 48% of width */
      display: flex;
      justify-content: flex-end;
    }

    .social-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr); /* 3 columns, 2 rows */
      grid-template-rows: repeat(2, 1fr);
      gap: 0.4rem;
      width: 100%;
      max-width: 120px; /* Constrain total width */
    }

    .social-links a {
      width: 34px;
      height: 34px;
    }

    .social-links svg {
      width: 16px;
      height: 16px;
    }

    .footer-bottom {
      padding-top: 0.8rem;
      gap: 0.6rem;
    }

    .footer-copyright p,
    .made-with {
      font-size: 0.75rem;
    }
  }
</style>