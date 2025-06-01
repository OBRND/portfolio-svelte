<script>
  // Import section components
  import About from './sections/About.svelte';
  import Skills from './sections/Skills.svelte';
  import Services from './sections/service.svelte';
  import Projects from './sections/Projects.svelte';
  import Contact from './sections/Contact.svelte';
</script>

<div class="sections-container">
  <section id="about" class="section">
    <About />
  </section>
  
  <section id="skills" class="section">
    <Skills />
  </section>
  
  <section id="projects" class="section">
    <Services />
  </section>
 
  <section id="projects" class="section">
    <Projects />
  </section> 
  
  <section id="contact" class="section">
    <Contact />
  </section>
</div>

<style>
  .sections-container {
    display: flex;
    flex-direction: column;
  }
  
  .section {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 2rem;
    padding-right: 2rem;
  }
</style>
