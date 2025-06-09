<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';

	let { data, form } = $props();

	// State management
	const editingProject = writable(null);
	const showAddForm = writable(false);
	const isSubmitting = writable(false);

	// Form data for new project
	const newProject = writable({
		title: '',
		subtitle: '',
		description: '',
		tags: '',
		technologies: '',
		image_link: '',
		source_link: '',
		year: new Date().getFullYear(),
		orders: 0
	});

	// Reset new project form
	function resetNewProject() {
		newProject.set({
			title: '',
			subtitle: '',
			description: '',
			tags: '',
			technologies: '',
			image_link: '',
			source_link: '',
			year: new Date().getFullYear(),
			orders: 0
		});
	}

	// Handle form submissions
	function handleSubmit() {
		isSubmitting.set(true);
		return async ({ result, update }) => {
			isSubmitting.set(false);
			if (result.type === 'success') {
				editingProject.set(null); // Exit edit mode
				showAddForm.set(false); // Hide add form
				resetNewProject(); // Clear add form
				await invalidateAll(); // Re-fetch data to show updated list
			}
			await update(); // Update SvelteKit's form state
		};
	}

	// Safe JSON parsing function (to handle potential stringified arrays from older data)
	function safeJsonParse(input, fallback = []) {
		// If input is already an array, return it directly
		if (Array.isArray(input)) {
			return input;
		}
		// If input is a string, try to parse it as JSON or split by comma
		if (typeof input === 'string') {
			try {
				const parsed = JSON.parse(input);
				// If parsed result is an array, return it. Otherwise, wrap it in an array.
				return Array.isArray(parsed) ? parsed : [parsed];
			} catch (e) {
				// If JSON parsing fails, assume comma-separated string
				return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
			}
		}
		// Fallback for other types
		return fallback;
	}

	// Format arrays for display in text inputs
	function formatArray(input) {
		const parsed = safeJsonParse(input, []);
		return parsed.join(', ');
	}
</script>

<div class="admin-container">
	<header class="admin-header">
		<h1>Projects Administration</h1>
		<p>Manage your project portfolio</p>
	</header>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="alert alert-success">
			{form.message || 'Operation completed successfully!'}
		</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">
			{form.message || 'An error occurred. Please try again.'}
		</div>
	{/if}

	<!-- Add New Project Button -->
	<div class="actions-bar">
		<button
			class="btn btn-primary"
			onclick={() => showAddForm.update(value => !value)}
			disabled={$isSubmitting}
		>
			{$showAddForm ? 'Cancel' : 'Add New Project'}
		</button>
	</div>

	<!-- Add New Project Form -->
	{#if $showAddForm}
		<div class="form-card">
			<h2>Add New Project</h2>
			<form method="POST" action="?/create" use:enhance={handleSubmit}>
				<div class="form-grid">
					<div class="form-group">
						<label for="new-title">Title *</label>
						<input
							id="new-title"
							name="title"
							type="text"
							bind:value={$newProject.title}
							required
						/>
					</div>

					<div class="form-group">
						<label for="new-subtitle">Subtitle</label>
						<input
							id="new-subtitle"
							name="subtitle"
							type="text"
							bind:value={$newProject.subtitle}
						/>
					</div>

					<div class="form-group">
						<label for="new-year">Year</label>
						<input
							id="new-year"
							name="year"
							type="number"
							bind:value={$newProject.year}
							min="2000"
							max="2030"
						/>
					</div>

					<div class="form-group">
						<label for="new-orders">Priority Order</label>
						<input
							id="new-orders"
							name="orders"
							type="number"
							bind:value={$newProject.orders}
						/>
					</div>

					<div class="form-group full-width">
						<label for="new-description">Description</label>
						<textarea
							id="new-description"
							name="description"
							bind:value={$newProject.description}
							rows="3"
						></textarea>
					</div>

					<div class="form-group">
						<label for="new-image-link">Image URL</label>
						<input
							id="new-image-link"
							name="image_link"
							type="url"
							bind:value={$newProject.image_link}
							placeholder="https://example.com/image.jpg"
						/>
					</div>

					<div class="form-group">
						<label for="new-source-link">Source Code URL</label>
						<input
							id="new-source-link"
							name="source_link"
							type="url"
							bind:value={$newProject.source_link}
							placeholder="https://github.com/username/repo"
						/>
					</div>

					<div class="form-group">
						<label for="new-tags">Tags (comma-separated)</label>
						<input
							id="new-tags"
							name="tags"
							type="text"
							bind:value={$newProject.tags}
							placeholder="mobile, ios, android"
						/>
					</div>

					<div class="form-group">
						<label for="new-technologies">Technologies (comma-separated)</label>
						<input
							id="new-technologies"
							name="technologies"
							type="text"
							bind:value={$newProject.technologies}
							placeholder="React, Node.js, MongoDB"
						/>
					</div>
				</div>

				<div class="form-actions">
					<button type="submit" class="btn btn-success" disabled={$isSubmitting}>
						{$isSubmitting ? 'Creating...' : 'Create Project'}
					</button>
					<button type="button" class="btn btn-secondary" onclick={() => showAddForm.set(false)}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Projects List -->
	<div class="projects-list">
		<h2>Current Projects ({data.projects.length})</h2>

		{#if data.projects.length === 0}
			<div class="empty-state">
				<p>No projects found. Add your first project above!</p>
			</div>
		{:else} <!-- FIX: Corrected syntax here -->
			{#each data.projects as project, index (project.id || `temp-${index}`)}
				<div class="project-card">
					<!-- Conditionally render Edit Form or Display Mode -->
					{#if $editingProject?.id === project.id}
						<!-- Edit Form - Dynamically choose action based on project.id -->
						<form
							method="POST"
							action={project.id && !String(project.id).startsWith('temp-') ? '?/update' : '?/create'}
							use:enhance={handleSubmit}
						>
							<!-- Only include hidden ID input if it's a real, non-temporary ID -->
							{#if project.id && !String(project.id).startsWith('temp-')}
								<input type="hidden" name="id" value={project.id} />
							{/if}

							<div class="form-grid">
								<div class="form-group">
									<label for="edit-title-{project.id}">Title *</label>
									<input
										id="edit-title-{project.id}"
										name="title"
										type="text"
										value={project.title || ''}
										required
									/>
								</div>

								<div class="form-group">
									<label for="edit-subtitle-{project.id}">Subtitle</label>
									<input
										id="edit-subtitle-{project.id}"
										name="subtitle"
										type="text"
										value={project.subtitle || ''}
									/>
								</div>

								<div class="form-group">
									<label for="edit-year-{project.id}">Year</label>
									<input
										id="edit-year-{project.id}"
										name="year"
										type="number"
										value={project.year || new Date().getFullYear()}
										min="2000"
										max="2030"
									/>
								</div>

								<div class="form-group">
									<label for="edit-orders-{project.id}">Priority Order</label>
									<input
										id="edit-orders-{project.id}"
										name="orders"
										type="number"
										value={project.orders || 0}
									/>
								</div>

								<div class="form-group full-width">
									<label for="edit-description-{project.id}">Description</label>
									<textarea
										id="edit-description-{project.id}"
										name="description"
										rows="3"
										value={project.description || ''}
									></textarea>
								</div>

								<div class="form-group">
									<label for="edit-image-link-{project.id}">Image URL</label>
									<input
										id="edit-image-link-{project.id}"
										name="image_link"
										type="url"
										value={project.image_link || ''}
									/>
								</div>

								<div class="form-group">
									<label for="edit-source-link-{project.id}">Source Code URL</label>
									<input
										id="edit-source-link-{project.id}"
										name="source_link"
										type="url"
										value={project.source_link || ''}
									/>
								</div>

								<div class="form-group">
									<label for="edit-tags-{project.id}">Tags (comma-separated)</label>
									<input
										id="edit-tags-{project.id}"
										name="tags"
										type="text"
										value={formatArray(project.tags)}
									/>
								</div>

								<div class="form-group">
									<label for="edit-technologies-{project.id}">Technologies (comma-separated)</label>
									<input
										id="edit-technologies-{project.id}"
										name="technologies"
										type="text"
										value={formatArray(project.technologies)}
									/>
								</div>
							</div>

							<div class="form-actions">
								<button type="submit" class="btn btn-success" disabled={$isSubmitting}>
									{$isSubmitting ? 'Saving...' : 'Save Changes'}
								</button>
								<button type="button" class="btn btn-secondary" onclick={() => editingProject.set(null)}>
									Cancel
								</button>
							</div>
						</form>
					{:else}
						<!-- Display Mode -->
						<div class="project-header">
							<div class="project-info">
								<h3>{project.title}</h3>
								<p class="subtitle">{project.subtitle || 'No subtitle'}</p>
								<div class="meta">
									<span class="year">Year: {project.year || 'N/A'}</span>
									<span class="order">Order: {project.orders || 0}</span>
								</div>
							</div>

							{#if project.image_link}
								<div class="project-thumbnail">
									<img src={project.image_link || "/placeholder.svg"} alt={project.title} />
								</div>
							{/if}
						</div>

						<div class="project-details">
							<p class="description">{project.description || 'No description available'}</p>

							{#if project.tags}
								<div class="tags-section">
									<strong>Tags:</strong>
									<div class="tags">
										{#each safeJsonParse(project.tags, []) as tag}
											<span class="tag">{tag}</span>
										{/each}
									</div>
								</div>
							{/if}

							{#if project.technologies}
								<div class="tech-section">
									<strong>Technologies:</strong>
									<div class="technologies">
										{#each safeJsonParse(project.technologies, []) as tech}
											<span class="tech">{tech}</span>
										{/each}
									</div>
								</div>
							{/if}

							{#if project.source_link}
								<div class="links-section">
									<a href={project.source_link} target="_blank" rel="noopener noreferrer" class="source-link">
										View Source Code
									</a>
								</div>
							{/if}
						</div>

						<div class="project-actions">
							<button
								class="btn btn-primary"
								onclick={() => editingProject.set(project)}
								disabled={$isSubmitting}
							>
								Edit
							</button>

							<form method="POST" action="?/delete" use:enhance={handleSubmit} style="display: inline;">
								<input type="hidden" name="id" value={project.orders} />
								<button
									type="submit"
									class="btn btn-danger"
									disabled={$isSubmitting}
									onclick={(e) => {
										// These logs will correctly fire when the button is clicked,
										// before the confirmation dialog appears.
										console.log(project.orders);
										console.log("deleting projects (client-side before confirm)");
										if (!confirm('Are you sure you want to delete this project?')) {
											e.preventDefault(); // Prevent form submission if user cancels
											console.log("Delete cancelled (client-side)"); // This log will now appear on cancel
										}
										// If the user confirms, the form will proceed to submit naturally
										// because the button type is "submit". SvelteKit's use:enhance
										// will then intercept it and call handleSubmit.
										// The `isSubmitting` state will be managed by handleSubmit.
									}}
								>
									{$isSubmitting ? 'Deleting...' : 'Delete'}
								</button>
							</form>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.admin-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #e5e7eb;
	}

	.admin-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.admin-header p {
		color: #6b7280;
		font-size: 1.1rem;
	}

	/* Alerts */
	.alert {
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
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

	/* Actions Bar */
	.actions-bar {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 2rem;
	}

	/* Buttons */
	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		border: none;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		display: inline-block;
		text-align: center;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #2563eb;
	}

	.btn-success {
		background-color: #10b981;
		color: white;
	}

	.btn-success:hover:not(:disabled) {
		background-color: #059669;
	}

	.btn-danger {
		background-color: #ef4444;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: #dc2626;
	}

	.btn-secondary {
		background-color: #6b7280;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #4b5563;
	}

	/* Form Card */
	.form-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
		border: 1px solid #e5e7eb;
	}

	.form-card h2 {
		margin-bottom: 1.5rem;
		color: #1f2937;
		font-size: 1.5rem;
	}

	/* Form Grid */
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.form-group input,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	/* Projects List */
	.projects-list h2 {
		color: #1f2937;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
		background: #f9fafb;
		border-radius: 8px;
		border: 2px dashed #d1d5db;
	}

	/* Project Card */
	.project-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		transition: box-shadow 0.2s;
	}

	.project-card:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.project-info h3 {
		color: #1f2937;
		font-size: 1.25rem;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: #6b7280;
		margin-bottom: 0.5rem;
	}

	.meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.project-thumbnail {
		width: 80px;
		height: 80px;
		border-radius: 8px;
		overflow: hidden;
		flex-shrink: 0;
	}

	.project-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.project-details {
		margin-bottom: 1.5rem;
	}

	.description {
		color: #4b5563;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.tags-section,
	.tech-section {
		margin-bottom: 1rem;
	}

	.tags,
	.technologies {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.tag,
	.tech {
		background: #f3f4f6;
		color: #374151;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.tech {
		background: #dbeafe;
		color: #1e40af;
	}

	.links-section {
		margin-top: 1rem;
	}

	.source-link {
		color: #3b82f6;
		text-decoration: none;
		font-weight: 500;
	}

	.source-link:hover {
		text-decoration: underline;
	}

	.project-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.admin-container {
			padding: 1rem;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.project-header {
			flex-direction: column;
			gap: 1rem;
		}

		.project-thumbnail {
			align-self: flex-start;
		}

		.form-actions,
		.project-actions {
			flex-direction: column;
		}

		.actions-bar {
			justify-content: center;
		}
	}
</style>
