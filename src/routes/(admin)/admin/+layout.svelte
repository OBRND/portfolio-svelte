<script>
  export let data;

</script>

<div class="admin-layout">
  <header class="admin-header">
    <h1>Admin Dashboard</h1>
    <nav>
      <ul>
        <li><a href="/admin/projects">Projects</a></li>
        <li><a href="/admin/messages">Messages</a></li>
        <li><a href="/">Back to Site</a></li>
      </ul>
    </nav>
  </header>

  <main class="admin-content">
    <slot />
  </main>
</div>

<style>
  .admin-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .admin-header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 2rem;
  }

  .admin-header h1 {
    margin: 0 0 1rem 0;
  }

  .admin-header nav ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 1.5rem;
  }

  .admin-header nav a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.3s;
  }

  .admin-header nav a:hover {
    opacity: 0.8;
  }

  .admin-content {
    flex: 1;
    padding: 2rem;
  }
</style>
