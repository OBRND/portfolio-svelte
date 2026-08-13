<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { writable } from 'svelte/store';

	let { data, form } = $props();

	// State shared by both sections
	const editingProject = writable(null);
	const isSubmitting = writable(false);

	// Each app type gets its own add-form toggle and its own blank-form state,
	// so opening one never clobbers the other and the category never needs
	// picking by hand — it's fixed to whichever section's button was pressed.
	const showAddMobileForm = writable(false);
	const showAddWebForm = writable(false);

	function blankProject(category: 'flutter' | 'web') {
		return {
			title: '',
			subtitle: '',
			description: '',
			tags: '',
			technologies: '',
			image_link: '',
			source_link: '',
			year: new Date().getFullYear(),
			orders: 0,
			category
		};
	}

	const newMobileProject = writable(blankProject('flutter'));
	const newWebProject = writable(blankProject('web'));

	const mobileProjects = $derived(data.projects.filter((p) => p.category !== 'web'));
	const webProjects = $derived(data.projects.filter((p) => p.category === 'web'));

	// Handle form submissions
	function handleSubmit() {
		isSubmitting.set(true);
		return async ({ result, update }) => {
			isSubmitting.set(false);
			if (result.type === 'success') {
				editingProject.set(null);
				showAddMobileForm.set(false);
				showAddWebForm.set(false);
				newMobileProject.set(blankProject('flutter'));
				newWebProject.set(blankProject('web'));
				await invalidateAll(); // Re-fetch data to show updated list
			}
			await update(); // Update SvelteKit's form state
		};
	}

	// Safe JSON parsing function (to handle potential stringified arrays from older data)
	function safeJsonParse(input, fallback = []) {
		if (Array.isArray(input)) return input;
		if (typeof input === 'string') {
			try {
				const parsed = JSON.parse(input);
				return Array.isArray(parsed) ? parsed : [parsed];
			} catch (e) {
				return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
			}
		}
		return fallback;
	}

	// Format arrays for display in text inputs
	function formatArray(input) {
		const parsed = safeJsonParse(input, []);
		return parsed.join(', ');
	}
</script>

{#snippet projectCard(project)}
	<div class="project-card">
		{#if $editingProject?.id === project.id}
			<form
				method="POST"
				action={project.id && !String(project.id).startsWith('temp-') ? '?/update' : '?/create'}
				enctype="multipart/form-data"
				use:enhance={handleSubmit}
			>
				{#if project.id && !String(project.id).startsWith('temp-')}
					<input type="hidden" name="id" value={project.id} />
				{/if}

				<div class="form-grid">
					<div class="form-group">
						<label for="edit-title-{project.id}">Title *</label>
						<input id="edit-title-{project.id}" name="title" type="text" value={project.title || ''} required />
					</div>

					<div class="form-group">
						<label for="edit-subtitle-{project.id}">Subtitle</label>
						<input id="edit-subtitle-{project.id}" name="subtitle" type="text" value={project.subtitle || ''} />
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
						<label for="edit-category-{project.id}">Stack</label>
						<select id="edit-category-{project.id}" name="category" value={project.category === 'web' ? 'web' : 'flutter'}>
							<option value="flutter">Flutter / mobile (shown in a phone frame)</option>
							<option value="web">Svelte / web (shown in a browser frame)</option>
						</select>
					</div>

					<div class="form-group">
						<label for="edit-orders-{project.id}">Priority Order</label>
						<input id="edit-orders-{project.id}" name="orders" type="number" value={project.orders || 0} />
					</div>

					<div class="form-group full-width">
						<label for="edit-description-{project.id}">Description</label>
						<textarea id="edit-description-{project.id}" name="description" rows="3">{project.description || ''}</textarea>
					</div>

					<div class="form-group full-width screenshot-group">
						<label for="edit-screenshot-{project.id}">Replace screenshot</label>
						<div class="screenshot-row">
							{#if project.image_link}
								<img class="screenshot-preview" src={project.image_link} alt="Current screenshot" />
							{/if}
							<div class="screenshot-inputs">
								<input id="edit-screenshot-{project.id}" name="screenshot" type="file" accept="image/*" />
								<p class="hint">
									{project.category === 'web'
										? 'Web screenshots crop to 16:10 (around 1600×1000). Leave blank to keep the current one.'
										: 'Phone screenshots crop to 1080×2340 (9:19.5). Leave blank to keep the current one.'}
								</p>
								<label for="edit-image-link-{project.id}" class="url-fallback-label">or paste a URL instead</label>
								<input id="edit-image-link-{project.id}" name="image_link" type="url" value={project.image_link || ''} />
							</div>
						</div>
					</div>

					<div class="form-group">
						<label for="edit-source-link-{project.id}">Source Code URL</label>
						<input id="edit-source-link-{project.id}" name="source_link" type="url" value={project.source_link || ''} />
					</div>

					<div class="form-group">
						<label for="edit-tags-{project.id}">Tags (comma-separated)</label>
						<input id="edit-tags-{project.id}" name="tags" type="text" value={formatArray(project.tags)} />
					</div>

					<div class="form-group">
						<label for="edit-technologies-{project.id}">Technologies (comma-separated)</label>
						<input id="edit-technologies-{project.id}" name="technologies" type="text" value={formatArray(project.technologies)} />
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
						<img src={project.image_link} alt={project.title} />
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
				<button class="btn btn-primary" onclick={() => editingProject.set(project)} disabled={$isSubmitting}>
					Edit
				</button>

				<form method="POST" action="?/delete" use:enhance={handleSubmit} style="display: inline;">
					<input type="hidden" name="id" value={project.orders} />
					<button
						type="submit"
						class="btn btn-danger"
						disabled={$isSubmitting}
						onclick={(e) => {
							if (!confirm('Are you sure you want to delete this project?')) {
								e.preventDefault();
							}
						}}
					>
						{$isSubmitting ? 'Deleting...' : 'Delete'}
					</button>
				</form>
			</div>
		{/if}
	</div>
{/snippet}

<div class="admin-container">
	<header class="admin-header">
		<h1>Projects Administration</h1>
		<p>Manage your Flutter and SvelteKit project stacks</p>
	</header>

	{#if form?.success}
		<div class="alert alert-success">{form.message || 'Operation completed successfully!'}</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.message || 'An error occurred. Please try again.'}</div>
	{/if}

	<!-- ---- Mobile / Flutter apps ------------------------------------------ -->
	<section class="app-section">
		<div class="section-header">
			<div>
				<h2>Mobile Apps <span class="section-tag flutter">Flutter</span></h2>
				<p class="section-hint">Shown in the phone canvas. Screenshots crop to 1080×2340 (9:19.5) — export your device screenshots at that resolution and they'll fill the frame exactly.</p>
			</div>
			<button class="btn btn-primary" onclick={() => showAddMobileForm.update((v) => !v)} disabled={$isSubmitting}>
				{$showAddMobileForm ? 'Cancel' : '+ Add Mobile App'}
			</button>
		</div>

		{#if $showAddMobileForm}
			<div class="form-card">
				<h3>Add Mobile App</h3>
				<form method="POST" action="?/create" enctype="multipart/form-data" use:enhance={handleSubmit}>
					<input type="hidden" name="category" value="flutter" />
					<div class="form-grid">
						<div class="form-group">
							<label for="mobile-title">Title *</label>
							<input id="mobile-title" name="title" type="text" bind:value={$newMobileProject.title} required />
						</div>

						<div class="form-group">
							<label for="mobile-subtitle">Subtitle</label>
							<input id="mobile-subtitle" name="subtitle" type="text" bind:value={$newMobileProject.subtitle} />
						</div>

						<div class="form-group">
							<label for="mobile-year">Year</label>
							<input id="mobile-year" name="year" type="number" bind:value={$newMobileProject.year} min="2000" max="2030" />
						</div>

						<div class="form-group">
							<label for="mobile-orders">Priority Order</label>
							<input id="mobile-orders" name="orders" type="number" bind:value={$newMobileProject.orders} />
						</div>

						<div class="form-group full-width">
							<label for="mobile-description">Description</label>
							<textarea id="mobile-description" name="description" bind:value={$newMobileProject.description} rows="3"></textarea>
						</div>

						<div class="form-group full-width screenshot-group">
							<label for="mobile-screenshot">Screenshot</label>
							<input id="mobile-screenshot" name="screenshot" type="file" accept="image/*" />
							<p class="hint">Best at 1080×2340 (9:19.5) — the native resolution of most phone screenshots.</p>
							<label for="mobile-image-link" class="url-fallback-label">or paste a URL instead</label>
							<input id="mobile-image-link" name="image_link" type="url" bind:value={$newMobileProject.image_link} placeholder="https://example.com/screenshot.png" />
						</div>

						<div class="form-group">
							<label for="mobile-source-link">Source Code URL</label>
							<input id="mobile-source-link" name="source_link" type="url" bind:value={$newMobileProject.source_link} placeholder="https://github.com/username/repo" />
						</div>

						<div class="form-group">
							<label for="mobile-tags">Tags (comma-separated)</label>
							<input id="mobile-tags" name="tags" type="text" bind:value={$newMobileProject.tags} placeholder="mobile, ios, android" />
						</div>

						<div class="form-group">
							<label for="mobile-technologies">Technologies (comma-separated)</label>
							<input id="mobile-technologies" name="technologies" type="text" bind:value={$newMobileProject.technologies} placeholder="Flutter, Dart, Firebase" />
						</div>
					</div>

					<div class="form-actions">
						<button type="submit" class="btn btn-success" disabled={$isSubmitting}>
							{$isSubmitting ? 'Creating...' : 'Add Mobile App'}
						</button>
						<button type="button" class="btn btn-secondary" onclick={() => showAddMobileForm.set(false)}>Cancel</button>
					</div>
				</form>
			</div>
		{/if}

		<div class="projects-list">
			{#if mobileProjects.length === 0}
				<div class="empty-state">
					<p>No mobile apps yet. Add your first one above.</p>
				</div>
			{:else}
				{#each mobileProjects as project, index (project.id ?? `temp-${index}`)}
					{@render projectCard(project)}
				{/each}
			{/if}
		</div>
	</section>

	<!-- ---- Web / SvelteKit apps --------------------------------------------- -->
	<section class="app-section">
		<div class="section-header">
			<div>
				<h2>Web Apps <span class="section-tag web">SvelteKit</span></h2>
				<p class="section-hint">Shown in the browser canvas. Screenshots crop to 16:10 — around 1600×1000 reads cleanest, but any 16:10-ish capture works.</p>
			</div>
			<button class="btn btn-primary" onclick={() => showAddWebForm.update((v) => !v)} disabled={$isSubmitting}>
				{$showAddWebForm ? 'Cancel' : '+ Add Web App'}
			</button>
		</div>

		{#if $showAddWebForm}
			<div class="form-card">
				<h3>Add Web App</h3>
				<form method="POST" action="?/create" enctype="multipart/form-data" use:enhance={handleSubmit}>
					<input type="hidden" name="category" value="web" />
					<div class="form-grid">
						<div class="form-group">
							<label for="web-title">Title *</label>
							<input id="web-title" name="title" type="text" bind:value={$newWebProject.title} required />
						</div>

						<div class="form-group">
							<label for="web-subtitle">Subtitle</label>
							<input id="web-subtitle" name="subtitle" type="text" bind:value={$newWebProject.subtitle} />
						</div>

						<div class="form-group">
							<label for="web-year">Year</label>
							<input id="web-year" name="year" type="number" bind:value={$newWebProject.year} min="2000" max="2030" />
						</div>

						<div class="form-group">
							<label for="web-orders">Priority Order</label>
							<input id="web-orders" name="orders" type="number" bind:value={$newWebProject.orders} />
						</div>

						<div class="form-group full-width">
							<label for="web-description">Description</label>
							<textarea id="web-description" name="description" bind:value={$newWebProject.description} rows="3"></textarea>
						</div>

						<div class="form-group full-width screenshot-group">
							<label for="web-screenshot">Screenshot</label>
							<input id="web-screenshot" name="screenshot" type="file" accept="image/*" />
							<p class="hint">Best around 1600×1000 (16:10) — a browser window or full-page capture cropped to that ratio.</p>
							<label for="web-image-link" class="url-fallback-label">or paste a URL instead</label>
							<input id="web-image-link" name="image_link" type="url" bind:value={$newWebProject.image_link} placeholder="https://example.com/screenshot.png" />
						</div>

						<div class="form-group">
							<label for="web-source-link">Source Code URL</label>
							<input id="web-source-link" name="source_link" type="url" bind:value={$newWebProject.source_link} placeholder="https://github.com/username/repo" />
						</div>

						<div class="form-group">
							<label for="web-tags">Tags (comma-separated)</label>
							<input id="web-tags" name="tags" type="text" bind:value={$newWebProject.tags} placeholder="web, ssr, dashboard" />
						</div>

						<div class="form-group">
							<label for="web-technologies">Technologies (comma-separated)</label>
							<input id="web-technologies" name="technologies" type="text" bind:value={$newWebProject.technologies} placeholder="SvelteKit, TypeScript, Supabase" />
						</div>
					</div>

					<div class="form-actions">
						<button type="submit" class="btn btn-success" disabled={$isSubmitting}>
							{$isSubmitting ? 'Creating...' : 'Add Web App'}
						</button>
						<button type="button" class="btn btn-secondary" onclick={() => showAddWebForm.set(false)}>Cancel</button>
					</div>
				</form>
			</div>
		{/if}

		<div class="projects-list">
			{#if webProjects.length === 0}
				<div class="empty-state">
					<p>No web apps yet. Add your first one above.</p>
				</div>
			{:else}
				{#each webProjects as project, index (project.id ?? `temp-${index}`)}
					{@render projectCard(project)}
				{/each}
			{/if}
		</div>
	</section>
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

	/* Sections */
	.app-section {
		margin-bottom: 3rem;
	}

	.app-section + .app-section {
		padding-top: 2.5rem;
		border-top: 2px solid #e5e7eb;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: #1f2937;
		font-size: 1.5rem;
	}

	.section-tag {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
	}

	.section-tag.flutter {
		background: #dbeafe;
		color: #1e40af;
	}

	.section-tag.web {
		background: #ffe4d6;
		color: #b5480a;
	}

	.section-hint {
		margin-top: 0.35rem;
		color: #6b7280;
		font-size: 0.9rem;
		max-width: 56ch;
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
		flex-shrink: 0;
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

	.form-card h3 {
		margin-bottom: 1.5rem;
		color: #1f2937;
		font-size: 1.25rem;
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
	.form-group textarea,
	.form-group select {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		background: #fff;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	/* Screenshot upload */
	.screenshot-group .hint {
		margin-top: 0.4rem;
		font-size: 0.825rem;
		color: #6b7280;
	}

	.url-fallback-label {
		margin-top: 0.9rem;
		font-size: 0.825rem;
		font-weight: 500;
		color: #6b7280;
	}

	.screenshot-row {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.screenshot-inputs {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.screenshot-preview {
		width: 64px;
		height: 64px;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid #d1d5db;
		flex-shrink: 0;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	/* Projects List */
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

		.section-header {
			flex-direction: column;
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
	}
</style>
