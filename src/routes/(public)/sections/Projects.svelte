<script lang="ts">
	import { run } from 'svelte/legacy';

	import { onMount, onDestroy } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// Simple reactive variables instead of stores
	let currentIndex = $state(0);
	let isTransitioning = $state(false);
	let isLoading = $state(true);
	let projects = $state([]);
	let error = $state(null);
	let selectedProject = $state(null);
	let isModalOpen = $state(false);
	let autoplayInterval;

	// Animation
	const translateX = tweened(0, { duration: 600, easing: cubicOut });

	// Fetch projects
	async function fetchProjects() {
		try {
			console.log("Fetching projects...");
			isLoading = true;
			error = null;
			
			const response = await fetch('/api/projects');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			console.log("Received projects:", data);
			projects = data || [];
			
			if (projects.length === 0) {
				console.warn("No projects received from API");
			}
		} catch (fetchError) {
			console.error('Failed to fetch projects:', fetchError);
			error = fetchError.message || 'Failed to load projects';
			projects = [];
		} finally {
			isLoading = false;
		}
	}

	// Modal functions
	function openModal(project) {
		selectedProject = project;
		isModalOpen = true;
		document.body.style.overflow = 'hidden';
		stopAutoplay();
	}

	function closeModal() {
		isModalOpen = false;
		selectedProject = null;
		document.body.style.overflow = 'auto';
		if (projects.length > 1) {
			startAutoplay();
		}
	}

	// Carousel navigation
	function goToSlide(index) {
		if (isTransitioning || index === currentIndex || !projects.length) return;
		
		isTransitioning = true;
		currentIndex = index;
		translateX.set(-index * 100);
		
		setTimeout(() => {
			isTransitioning = false;
		}, 600);
	}

	function nextSlide() {
		if (!projects.length) return;
		const nextIndex = (currentIndex + 1) % projects.length;
		goToSlide(nextIndex);
	}

	function prevSlide() {
		if (!projects.length) return;
		const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
		goToSlide(prevIndex);
	}

	// Auto-play
	function startAutoplay() {
		stopAutoplay(); // Clear any existing interval
		if (projects.length > 1 && !isModalOpen) {
			autoplayInterval = setInterval(nextSlide, 5000);
		}
	}

	function stopAutoplay() {
		if (autoplayInterval) {
			clearInterval(autoplayInterval);
			autoplayInterval = null;
		}
	}

	// Handle image errors
	function handleImageError(event) {
		const img = event.target;
		img.src = '/placeholder.svg?height=600&width=300';
	}

	// Keyboard navigation
	function handleKeydown(event) {
		if (isModalOpen && event.key === 'Escape') {
			closeModal();
			return;
		}
		
		if (projects.length === 0 || isModalOpen) return;
		
		if (event.key === 'ArrowLeft') prevSlide();
		if (event.key === 'ArrowRight') nextSlide();
	}

	// Reactive statements for autoplay
	run(() => {
		if (projects.length > 1 && !isModalOpen) {
			startAutoplay();
		} else {
			stopAutoplay();
		}
	});

	// Lifecycle
	onMount(() => {
		fetchProjects();
	});

</script>

<svelte:window onkeydown={handleKeydown} />

<div class="projects-page-container">
	<section class="projects-header-section">
		<div class="section-content-wrapper">
			<h1 class="section-title centered-title">MY PROJECTS</h1>
			{#if isLoading}
				<p class="loading-text">Loading projects...</p>
			{:else if error}
				<p class="error-text">Error: {error}</p>
			{/if}
		</div>
	</section>

	<section class="carousel-section">
		{#if error && !isLoading}
			<div class="no-projects">
				<div class="section-content-wrapper">
					<div class="empty-state error-state">
						<h2>Connection Error</h2>
						<p>{error}</p>
						<p class="error-details">Please check your internet connection and Supabase configuration.</p>
						<button class="refresh-button" onclick={fetchProjects} disabled={isLoading}>
							{isLoading ? 'Loading...' : 'Try Again'}
						</button>
					</div>
				</div>
			</div>
		{:else if projects.length === 0 && !isLoading}
			<div class="no-projects">
				<div class="section-content-wrapper">
					<div class="empty-state">
						<h2>No Projects Found</h2>
						<p>No projects are available at the moment.</p>
						<button class="refresh-button" onclick={fetchProjects} disabled={isLoading}>
							{isLoading ? 'Loading...' : 'Refresh'}
						</button>
					</div>
				</div>
			</div>
		{:else if projects.length > 0}
			<div class="carousel-wrapper">
				<div class="section-content-wrapper">
					<!-- Carousel Container -->
					<div 
						class="carousel-container"
						onmouseenter={stopAutoplay}
						onmouseleave={() => projects.length > 1 && !isModalOpen && startAutoplay()}
						role="region"
						aria-label="Projects carousel"
					>
						<div 
							class="carousel-track" 
							style="transform: translateX({$translateX}%)"
							aria-live="polite"
						>
							{#each projects as project, index (project.id || index)}
								<div class="carousel-slide">
									<div class="project-card {index === currentIndex ? 'active' : ''}">
										<div class="project-screenshot-container">
											<div class="project-screenshot-inner">
												<img 
													src={project.screenshot || "/placeholder.svg?height=600&width=300"} 
													alt="{project.name} App Screenshot" 
													class="project-screenshot"
													onerror={handleImageError}
													loading="lazy"
												/>
											</div>
										</div>
										
										<div class="project-details">
											<div class="project-header">
												<div class="project-title-section">
													<h2 class="project-name">{project.name}</h2>
													<p class="project-subtitle">{project.subtitle}</p>
												</div>
												<div class="project-status">
													<span class="status-badge">{project.status}</span>
													<span class="project-year">{project.year}</span>
												</div>
											</div>

											{#if project.tags && project.tags.length > 0}
												<div class="details-group">
													<h3 class="group-title">Tags</h3>
													<div class="tag-list">
														{#each project.tags as tag}
															<span class="tag-item">{tag}</span>
														{/each}
													</div>
												</div>
											{/if}

											{#if project.technologies && project.technologies.length > 0}
												<div class="details-group">
													<h3 class="group-title">Technologies</h3>
													<div class="tech-list">
														{#each project.technologies as tech}
															<span class="tech-item">{tech}</span>
														{/each}
													</div>
												</div>
											{/if}

											<!-- View Details Button -->
											<button class="details-button" onclick={() => openModal(project)}>
												View Details
												<svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
													<circle cx="12" cy="12" r="3"/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Navigation Controls -->
				{#if projects.length > 1}
					<button class="carousel-nav prev" onclick={prevSlide} disabled={isTransitioning} aria-label="Previous Slide">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M15 18l-6-6 6-6"/>
						</svg>
					</button>
					
					<button class="carousel-nav next" onclick={nextSlide} disabled={isTransitioning} aria-label="Next Slide">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M9 18l6-6-6-6"/>
						</svg>
					</button>

					<!-- Pagination Dots -->
					<div class="carousel-pagination">
						{#each projects as _, index}
							<button 
								class="pagination-dot {index === currentIndex ? 'active' : ''}"
								onclick={() => goToSlide(index)}
								aria-label={`Go to slide ${index + 1}`}
							></button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</section>

	<!-- Modal -->
	{#if isModalOpen && selectedProject}
		<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1" onclick={closeModal}>
			<div class="modal-content" onclick={(event) => event.stopPropagation()}>
				<button class="modal-close" onclick={closeModal} aria-label="Close modal">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
				
				<div class="modal-body">
					<div class="modal-details">
						<div class="modal-header">
							<div class="modal-title-section">
								<h2 id="modal-title" class="modal-project-name">{selectedProject.name}</h2>
								<p class="modal-project-subtitle">{selectedProject.subtitle}</p>
							</div>
						</div>

						{#if selectedProject.technologies && selectedProject.technologies.length > 0}
							<div class="modal-details-group">
								<h3 class="modal-group-title">Technologies</h3>
								<div class="tech-list">
									{#each selectedProject.technologies as tech}
										<span class="tech-item">{tech}</span>
									{/each}
								</div>
							</div>
						{/if}

						<div class="modal-details-group">
							<h3 class="modal-group-title">Description</h3>
							<p class="modal-project-description">{selectedProject.description}</p>
						</div>

						{#if selectedProject.detailsLink && selectedProject.detailsLink !== '#'}
							<a href={selectedProject.detailsLink} class="github-button" target="_blank" rel="noopener noreferrer">
								<svg class="github-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
								View Source Code
							</a>
						{:else}
							<button class="github-button disabled" disabled>
								Coming Soon
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Variables */
	:root {
		--text-dark: #2c3e50;
		--text-medium: #555;
		--bg-light-purple: #f8f4fa;
		--bg-white: #ffffff;
		--svelte-orange: #FF3E00;
		--border-light: #e0e0e0;
		--tag-bg: #f0f0f0;
		--tag-text: #666;
		--tech-bg: #e0f2fe;
		--tech-text: #0277bd;
		--image-padding: 1.5rem;
		--error-red: #dc2626;
		--shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		--radius: 12px;
	}

	/* Base Styles */
	.projects-page-container {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		width: 100%;
		overflow-x: hidden;
		color: var(--text-color);
		line-height: 1.6;
		background-color: var(--bg-primary);
	}

	.section-content-wrapper {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
		box-sizing: border-box;
	}

	/* Header */
	.projects-header-section {
		padding-top: 2rem;
		padding-bottom: 1rem;
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

	.loading-text, .error-text {
		text-align: center;
		margin-top: 0.5rem;
	}

	.loading-text {
		color: var(--text-medium);
		font-style: italic;
	}

	.error-text {
		color: var(--error-red);
		font-weight: 500;
	}

	/* Empty States */
	.no-projects {
		padding: 3rem 0;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		background-color: var(--bg-white);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}

	.error-state {
		border-left: 4px solid var(--error-red);
	}

	.error-details {
		font-size: 0.9rem;
		color: var(--text-medium);
		margin-bottom: 1rem;
	}

	.refresh-button {
		background-color: var(--svelte-orange);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.refresh-button:hover:not(:disabled) {
		background-color: #e63900;
	}

	.refresh-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Carousel */
	.carousel-section {
		padding: 1.5rem 0 3rem 0;
	}

	.carousel-wrapper {
		position: relative;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 4rem;
	}

	.carousel-container {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: var(--radius);
	}

	.carousel-track {
		display: flex;
		width: 100%;
		transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.carousel-slide {
		flex: 0 0 100%;
		width: 100%;
	}

	/* Project Card */
	.project-card {
		background-color: transparent;
		border-radius: var(--radius);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		transform: scale(0.95);
		opacity: 0.8;
	}

	.project-card.active {
		transform: scale(1);
		opacity: 1;
	}

	.project-card:hover {
		transform: scale(1.02) translateY(-8px);
		opacity: 1;
	}

	/* Screenshot Container */
	.project-screenshot-container {
		position: relative;
		width: 100%;
		height: 250px;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: var(--radius) var(--radius) 0 0;
		background-color: transparent;
	}

	.project-screenshot-inner {
		position: relative;
		width: calc(100% - (2 * var(--image-padding)));
		height: calc(100% - (2 * var(--image-padding)));
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: transparent;
	}

	.project-screenshot-inner::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 80px;
		background: linear-gradient(to top, var(--bg-light-purple), transparent);
		pointer-events: none;
	}

	.project-screenshot {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		object-position: top;
	}

	/* Project Details */
	.project-details {
		width: 100%;
		background-color: var(--bg-secondary);
		border-radius: 0 0 var(--radius) var(--radius);
		padding: 1.5rem;
		box-sizing: border-box;
		text-align: center;
		flex-grow: 1;
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
		text-align: left;
	}

	.project-title-section {
		flex: 1;
	}

	.project-name {
		font-size: 2rem;
		font-weight: 800;
		margin-bottom: 0.25rem;
		color: var(--text-dark);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1.1;
	}

	.project-subtitle {
		font-size: 0.9rem;
		color: var(--text-medium);
		font-weight: 500;
		margin: 0;
	}

	.project-status {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background-color: #dbeafe;
		color: #1e40af;
	}

	.project-year {
		font-size: 0.8rem;
		color: var(--text-medium);
		font-weight: 500;
	}

	.details-group {
		margin-bottom: 1.5rem;
		text-align: left;
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

	.tech-item {
		background-color: var(--tech-bg);
		color: var(--tech-text);
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
		margin-top: 1.5rem;
		border: none;
		cursor: pointer;
	}

	.details-button:hover {
		background-color: #e63900;
		transform: translateY(-2px);
	}

	.button-icon {
		transition: transform 0.3s ease;
	}

	.details-button:hover .button-icon {
		transform: translateX(4px);
	}

	/* Navigation Controls */
	.carousel-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background-color: rgba(255, 255, 255, 0.95);
		border: none;
		border-radius: 50%;
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 10;
		box-shadow: var(--shadow);
		backdrop-filter: blur(10px);
	}

	.carousel-nav:hover {
		background-color: var(--svelte-orange);
		color: white;
		transform: translateY(-50%) scale(1.1);
		box-shadow: 0 6px 20px rgba(255, 62, 0, 0.3);
	}

	.carousel-nav:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.carousel-nav.prev {
		left: 0;
	}

	.carousel-nav.next {
		right: 0;
	}

	/* Pagination Dots */
	.carousel-pagination {
		position: absolute;
		bottom: -2.5rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.75rem;
		z-index: 10;
	}

	.pagination-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: none;
		background-color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.pagination-dot.active {
		background-color: var(--svelte-orange);
		transform: scale(1.3);
		box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
	}

	.pagination-dot:hover {
		background-color: var(--svelte-orange);
		opacity: 0.8;
		transform: scale(1.1);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
		backdrop-filter: blur(4px);
		animation: fadeIn 0.3s ease-out;
	}

	.modal-content {
		background-color: var(--bg-white);
		border-radius: 16px;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: modalSlideIn 0.3s ease-out;
	}

	.modal-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 1001;
		transition: all 0.3s ease;
		box-shadow: var(--shadow);
	}

	.modal-close:hover {
		background: var(--svelte-orange);
		color: white;
		transform: scale(1.1);
	}

	.modal-body {
		padding: 2rem;
	}

	.modal-header {
		margin-bottom: 2rem;
	}

	.modal-title-section {
		text-align: center;
	}

	.modal-project-name {
		font-size: 2.5rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
		color: var(--text-dark);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1.1;
	}

	.modal-project-subtitle {
		font-size: 1.1rem;
		color: var(--text-medium);
		font-weight: 500;
		margin: 0;
	}

	.modal-details-group {
		margin-bottom: 2rem;
	}

	.modal-group-title {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--text-dark);
		margin-bottom: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.modal-project-description {
		font-size: 1.1rem;
		color: var(--text-medium);
		line-height: 1.7;
		margin: 0;
	}

	.github-button {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		background-color: #24292e;
		color: var(--bg-white);
		padding: 1rem 2rem;
		border-radius: 30px;
		text-decoration: none;
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.3s ease;
		border: none;
		cursor: pointer;
		margin-top: 1rem;
	}

	.github-button:hover:not(.disabled) {
		background-color: #000;
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
	}

	.github-button.disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.github-icon {
		transition: transform 0.3s ease;
	}

	.github-button:hover:not(.disabled) .github-icon {
		transform: rotate(10deg);
	}

	/* Animations */
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Mobile Optimizations */
	@media (max-width: 767px) {
		.projects-header-section {
			padding-top: 1rem;
			padding-bottom: 0.5rem;
		}

		.section-content-wrapper {
			padding: 0 0.5rem;
		}

		.centered-title {
			font-size: 1.1rem;
			margin-bottom: 1rem;
		}

		.carousel-section {
			padding: 1rem 0 2rem 0;
		}

		.carousel-wrapper {
			padding: 0;
			margin: 0;
		}

		.project-card {
			margin: 0 0.5rem;
			transform: scale(1);
		}

		.project-card.active {
			transform: scale(1);
		}

		.project-card:hover {
			transform: scale(1);
		}

		.project-screenshot-container {
			height: 200px;
		}

		.project-screenshot-inner {
			width: calc(100% - 1rem);
			height: calc(100% - 1rem);
		}

		.project-details {
			padding: 1rem;
		}

		.project-name {
			font-size: 1.5rem;
		}

		.project-header {
			flex-direction: column;
			gap: 0.5rem;
			margin-bottom: 1rem;
		}

		.project-status {
			align-items: flex-start;
			flex-direction: row;
			gap: 0.5rem;
		}

		.details-group {
			margin-bottom: 1rem;
		}

		.group-title {
			font-size: 0.9rem;
		}

		.tag-item, .tech-item {
			font-size: 0.8rem;
			padding: 0.25rem 0.6rem;
		}

		.details-button {
			padding: 0.7rem 1.2rem;
			font-size: 0.85rem;
			margin-top: 1rem;
		}

		/* Navigation for mobile - overlay on carousel */
		.carousel-nav {
			width: 44px;
			height: 44px;
			top: 40%;
			background-color: rgba(255, 255, 255, 0.9);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		}

		.carousel-nav.prev {
			left: 0.5rem;
		}

		.carousel-nav.next {
			right: 0.5rem;
		}

		.carousel-pagination {
			bottom: -2rem;
			gap: 0.5rem;
		}

		.pagination-dot {
			width: 12px;
			height: 12px;
		}

		/* Modal optimizations for mobile */
		.modal-overlay {
			padding: 0.5rem;
		}

		.modal-content {
			margin: 0;
			max-height: 95vh;
			border-radius: 12px;
		}

		.modal-body {
			padding: 1.5rem;
		}

		.modal-project-name {
			font-size: 1.8rem;
		}

		.modal-header {
			margin-bottom: 1.5rem;
		}

		.modal-details-group {
			margin-bottom: 1.5rem;
		}

		.modal-group-title {
			font-size: 1rem;
		}

		.github-button {
			padding: 0.8rem 1.5rem;
			font-size: 0.9rem;
		}
	}

	/* Extra small screens (400px and below) */
	@media (max-width: 400px) {
		.section-content-wrapper {
			padding: 0 0.25rem;
		}

		.project-card {
			margin: 0 0.25rem;
		}

		.project-screenshot-container {
			height: 180px;
		}

		.project-details {
			padding: 0.75rem;
		}

		.project-name {
			font-size: 1.3rem;
		}

		.carousel-nav {
			width: 40px;
			height: 40px;
		}

		.carousel-nav.prev {
			left: 0.25rem;
		}

		.carousel-nav.next {
			right: 0.25rem;
		}

		.modal-body {
			padding: 1rem;
		}

		.modal-project-name {
			font-size: 1.6rem;
		}
	}

	/* Tablet and larger screens */
	@media (min-width: 768px) {
		.projects-header-section {
			padding-top: 3rem;
			padding-bottom: 1.5rem;
		}

		.centered-title {
			font-size: 1.5rem;
		}

		.carousel-section {
			padding: 2.5rem 0 4rem 0;
		}

		.carousel-wrapper {
			padding: 0 5rem;
		}

		.project-card {
			flex-direction: row;
		}

		.project-screenshot-container {
			width: 40%;
			height: auto;
			min-height: 400px;
			border-radius: var(--radius) 0 0 var(--radius);
		}

		.project-screenshot-inner {
			position: absolute;
			top: var(--image-padding);
			left: var(--image-padding);
			right: var(--image-padding);
			bottom: var(--image-padding);
			width: auto;
			height: auto;
		}

		.project-details {
			width: 60%;
			padding: 2rem;
			text-align: left;
			border-radius: 0 var(--radius) var(--radius) 0;
		}

		.project-name {
			font-size: 2.5rem;
		}

		.carousel-pagination {
			bottom: -3rem;
		}

		.modal-content {
			max-width: 700px;
		}
	}
</style>
