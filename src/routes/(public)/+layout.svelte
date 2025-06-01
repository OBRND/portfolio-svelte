<script>
  // Smooth scroll function
  function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<div class="app">
  <header class="navbar">
    <nav>
      <ul>
        <li><a href="#about" on:click|preventDefault={() => scrollToSection('about')}>About</a></li>
        <li><a href="#skills" on:click|preventDefault={() => scrollToSection('skills')}>Skills</a></li>
        <li><a href="#projects" on:click|preventDefault={() => scrollToSection('projects')}>Projects</a></li>
        <li><a href="#contact" on:click|preventDefault={() => scrollToSection('contact')}>Contact</a></li>
    </ul>
    </nav>
  </header>

  <main>
    <slot />
  </main>

  <footer>
    <p>© {new Date().getFullYear()} My Portfolio</p>
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .navbar {
    position: sticky;
    top: 0;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 100;
    padding: 1rem;
  }

  nav ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    justify-content: center;
    gap: 2rem;
  }

  nav a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
  }

  nav a:hover {
    color: #0070f3;
  }

  main {
    flex: 1;
  }

  footer {
    text-align: center;
    padding: 2rem;
    background-color: #f9f9f9;
  }
</style>
