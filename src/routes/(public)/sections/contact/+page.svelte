<script lang="ts">
    import { enhance } from '$app/forms';
    import { writable } from 'svelte/store';
  
    // Use $props() to access page data and form actions results
    let { form } = $props();
  
    // Writable store for form fields
    const contactForm = writable({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  
    // Writable store for submission status
    const isSubmitting = writable(false);
  
    // Handle form submission with SvelteKit's enhance action
    function handleSubmit(event) {
      event.preventDefault(); // Prevent default form submission
      isSubmitting.set(true); // Set submitting state to true
      return async ({ result, update }) => {
        isSubmitting.set(false); // Reset submitting state after response
  
        if (result.type === 'success') {
          // Clear the form on successful submission
          contactForm.set({ name: '', email: '', subject: '', message: '' });
        }
        await update(); // Update the page with the latest form result
      };
    }
  </script>
  
  <div class="contact-page-container">
    <section class="contact-header-section">
      <div class="section-content-wrapper">
        <h2 class="section-title centered-title">CONTACT ME</h2>
        <p class="form-intro-text">
          Let's connect! I'm always open to discussing new opportunities and ideas.
        </p>
      </div>
    </section>
  
    <section class="contact-form-section">
      <div class="section-content-wrapper">
        <div class="form-card">
          <!-- Success/Error Messages from server action -->
          {#if form?.success}
            <div class="alert alert-success" role="alert">
              <strong class="font-bold">Success!</strong>
              <span class="block sm:inline">{form.message || 'Your message has been sent.'}</span>
            </div>
          {/if}
  
          {#if form?.error}
            <div class="alert alert-error" role="alert">
              <strong class="font-bold">Error!</strong>
              <span class="block sm:inline">{form.message || 'Failed to send your message. Please try again.'}</span>
            </div>
          {/if}
  
          <form class="contact-form" method="POST" action="?/default" onsubmit={handleSubmit}>
            <div class="form-group">
              <label for="name">Your Name <span class="required-asterisk">*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                autocomplete="name"
                required
                placeholder="Enter your name"
                bind:value={$contactForm.name}
              />
            </div>
            <div class="form-group">
              <label for="email-address">Email Address <span class="required-asterisk">*</span></label>
              <input
                id="email-address"
                name="email"
                type="email"
                autocomplete="email"
                required
                placeholder="Enter your email"
                bind:value={$contactForm.email}
              />
            </div>
            <div class="form-group">
              <label for="subject">Subject <span class="required-asterisk">*</span></label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                placeholder="Enter subject"
                bind:value={$contactForm.subject}
              />
            </div>
            <div class="form-group full-width">
              <label for="message">Your Message <span class="required-asterisk">*</span></label>
              <textarea
                id="message"
                name="message"
                rows="6"
                required
                placeholder="Write your message here..."
                bind:value={$contactForm.message}
              ></textarea>
            </div>
  
            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-submit-message"
                disabled={$isSubmitting}
              >
                <div class="btn-content">
                  <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m3 3 3 9-3 9 19-9Z"/>
                    <path d="m6 12 13 0"/>
                  </svg>
                  <span class="btn-text">{$isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </div>
                <div class="btn-shine"></div>
              </button>
            </div>
          </form>
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
        --text-light: #f0f0f0;
        --bg-light-purple: #f8f4fa;
        --bg-white: #ffffff;
        --border-color: #e0e0e0;
        --input-border: #d1d5db;
        --focus-border: #3b82f6;
        --shadow-color: rgba(0, 0, 0, 0.1);
    }
  
    .contact-page-container {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      width: 100%;
      overflow-x: hidden;
      color: var(--text-color);
      line-height: 1.6;
      background-color: var(--bg-primary);
    }
  
    .section-content-wrapper {
        max-width: 800px; /* Adjusted max-width for contact form */
        margin: 0 auto;
        padding: 0 1.5rem;
        box-sizing: border-box;
    }
  
    .contact-header-section {
      padding: 3rem 0 1.5rem 0; /* Adjusted padding */
      background-color: var(--bg-primary);
      text-align: center;
    }
  
    .section-title {
      font-size: 1.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 1rem;
      color: var(--text-dark);
      position: relative;
      display: inline-block; /* Changed to inline-block for centered ::after */
      padding-bottom: 0.5rem;
    }
  
    .section-title::after {
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
  
    .form-intro-text {
      font-size: 1rem; /* Reduced from 1.1rem */
      color: #777; /* Lighter color, changed from var(--text-medium) */
      margin-top: 1.5rem;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      opacity: 0.8; /* Added subtle opacity */
    }
  
    .contact-form-section {
      padding: 1.5rem 0 4rem 0; /* Adjusted vertical padding */
      background-color: var(--bg-primary);
    }
  
    .form-card {
      background: var(--bg-white);
      border-radius: 12px;
      padding: 2.5rem; /* Increased padding */
      box-shadow: 0 4px 15px var(--shadow-color); /* Stronger shadow */
      border: 1px solid var(--border-color);
    }
  
    /* Alerts */
    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem; /* Increased margin */
      font-weight: 500;
    }
  
    .alert-success {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
  
    .alert-error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
  
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem; /* Space between form groups */
    }
  
    .form-group {
      display: flex;
      flex-direction: column;
    }
  
    .form-group.full-width {
      width: 100%;
    }
  
    .form-group label {
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }
  
    .required-asterisk {
      color: red;
      margin-left: 0.25rem; /* Small space after label text */
    }
  
    .form-group input,
    .form-group textarea {
      padding: 0.75rem 1rem; /* Slightly more horizontal padding */
      border: 1px solid var(--input-border);
      border-radius: 8px; /* Slightly more rounded corners */
      font-size: 1rem;
      color: var(--text-dark);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      background-color: var(--bg-white);
    }
  
    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: var(--text-medium);
      opacity: 0.7; /* Slightly faded placeholder */
    }
  
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--flutter-blue); /* Blue focus color */
      box-shadow: 0 0 0 3px rgba(58, 154, 233, 0.2); /* Soft blue shadow on focus */
    }
  
    .form-actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center; /* Changed from flex-end to center */
    }
  
    .btn {
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
    }
  
    .btn:disabled {
      cursor: not-allowed;
    }
  
    /* Enhanced Submit Button Styles */
    .btn-submit-message {
      position: relative;
      overflow: hidden;
      border-radius: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 180px;
      height: 56px;
    }
  
    .btn-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      color: white;
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
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transition: left 0.6s ease;
    }
  
    .btn-submit-message:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    }
  
    .btn-submit-message:hover:not(:disabled) .btn-icon {
      transform: translateX(4px) rotate(15deg);
    }
  
    .btn-submit-message:hover:not(:disabled) .btn-shine {
      left: 100%;
    }
  
    .btn-submit-message:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    }
  
    .btn-submit-message:disabled {
      opacity: 0.7;
      transform: none;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
    }
  
    .btn-submit-message:disabled .btn-content {
      color: rgba(255, 255, 255, 0.8);
    }
  
    /* Loading animation for disabled state */
    .btn-submit-message:disabled .btn-icon {
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  
    /* Responsive Adjustments */
    @media (min-width: 768px) {
      .contact-header-section {
        padding: 4rem 0 2rem 0;
      }
      .section-title {
        font-size: 2.2rem;
      }
      .form-intro-text {
        font-size: 1.2rem;
      }
      .contact-form-section {
        padding: 2rem 0 5rem 0;
      }
      .form-card {
        padding: 3rem;
      }
      .contact-form {
        gap: 1.5rem;
      }
    }
  
    @media (min-width: 1024px) {
      .contact-header-section {
        padding: 5rem 0 2.5rem 0;
      }
      .section-title {
        font-size: 2.5rem;
      }
      .form-intro-text {
        font-size: 1.3rem;
      }
      .contact-form-section {
        padding: 2.5rem 0 6rem 0;
      }
      .form-card {
        padding: 3.5rem;
      }
      .contact-form {
        gap: 1.75rem;
      }
    }
  
    @media (min-width: 1400px) {
      .section-content-wrapper {
        max-width: 900px;
      }
    }
  
    @media (max-width: 480px) {
      .btn-submit-message {
        min-width: 160px;
        height: 52px;
      }
      
      .btn-content {
        padding: 0.875rem 1.5rem;
        font-size: 0.95rem;
      }
      
      .btn-icon {
        width: 18px;
        height: 18px;
      }
    }
  </style>
