<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import ProjectStack from '$lib/components/ProjectStack.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import DeviceFrame from '$lib/components/ui/DeviceFrame.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { StackProject } from '$lib/components/ProjectStack.svelte';

	interface Props {
		projects?: (StackProject & { category: string })[];
		projectsError?: string | null;
	}

	let { projects = [], projectsError = null }: Props = $props();

	// Retry state for the client-side recovery path when the server load failed.
	let clientProjects = $state<(StackProject & { category: string })[] | null>(null);
	let retrying = $state(false);
	let retryError = $state<string | null>(null);

	const all = $derived(clientProjects ?? projects);
	const flutterProjects = $derived(all.filter((p) => p.category !== 'web'));
	const webProjects = $derived(all.filter((p) => p.category === 'web'));
	const activeError = $derived(retryError ?? (clientProjects ? null : projectsError));

	let selected = $state<StackProject | null>(null);
	let selectedDevice = $state<'phone' | 'browser'>('phone');

	function openCase(project: StackProject, device: 'phone' | 'browser') {
		selected = project;
		selectedDevice = device;
	}

	async function retry() {
		retrying = true;
		retryError = null;
		try {
			const response = await fetch('/api/projects');
			if (!response.ok) throw new Error(`Request failed (${response.status})`);
			clientProjects = await response.json();
		} catch (err) {
			retryError = err instanceof Error ? err.message : 'Could not reach the server.';
		} finally {
			retrying = false;
		}
	}
</script>

<div class="projects">
	{#if activeError && all.length === 0}
		<Section index="04" eyebrow="Selected work" title="Projects">
			<div class="state error" data-reveal use:reveal={{ y: 16 }}>
				<h3>Couldn't load the project list</h3>
				<p>{activeError}</p>
				<button type="button" class="retry" onclick={retry} disabled={retrying}>
					{retrying ? 'Retrying…' : 'Try again'}
				</button>
			</div>
		</Section>
	{:else}
		<!-- ---------------------------------------------------------------
		     Mobile / Flutter
		     --------------------------------------------------------------- -->
		<Section
			index="04"
			eyebrow="Selected work: mobile"
			title="Cross-platform apps, built in Flutter and shipped to production"
			lead="Delivery, fintech and planning apps running on iOS and Android from one Dart codebase. Real-time data with Firebase, offline-first local storage, third-party payment and mapping integrations, and release pipelines to both stores."
			class="theme-flutter"
			ambient
		>
			{#snippet aside()}
				<span class="count">{flutterProjects.length} projects</span>
			{/snippet}

			{#if flutterProjects.length > 0}
				<div data-reveal use:reveal={{ y: 28 }}>
					<ProjectStack
						projects={flutterProjects}
						device="phone"
						label="Flutter projects"
						paused={selected !== null}
						onselect={(project) => openCase(project, 'phone')}
					/>
				</div>
			{:else}
				<div class="state" data-reveal use:reveal={{ y: 16 }}>
					<p>No mobile projects published yet.</p>
				</div>
			{/if}
		</Section>

		<!-- ---------------------------------------------------------------
		     Web / Svelte
		     --------------------------------------------------------------- -->
		<Section
			index="05"
			eyebrow="Selected work: web"
			title="Server-rendered web apps, built in SvelteKit"
			lead="Fast, accessible interfaces backed by Postgres. Server-side rendering and form actions, Supabase auth with route guards, custom admin tooling, and continuous deployment to Vercel."
			class="theme-svelte"
			tone="inset"
		>
			{#snippet aside()}
				<span class="count">{webProjects.length} projects</span>
			{/snippet}

			{#if webProjects.length > 0}
				<div data-reveal use:reveal={{ y: 28 }}>
					<ProjectStack
						projects={webProjects}
						device="browser"
						label="Web projects"
						paused={selected !== null}
						onselect={(project) => openCase(project, 'browser')}
					/>
				</div>
			{:else}
				<div class="empty-web" data-reveal use:reveal={{ y: 24 }}>
					<div class="empty-frame" aria-hidden="true">
						<DeviceFrame variant="browser" url="in-progress" />
					</div>
					<div class="empty-copy">
						<h3>Web case studies are being written up</h3>
						<p>
							This site and its admin CMS are both SvelteKit, server-rendered routes, form
							actions, Supabase auth and row-level guards. They'll appear here as soon as the
							write-ups are done.
						</p>
						<p class="empty-note">
							Mark a project as <strong>Svelte / web</strong> in the admin and it joins this stack
							automatically.
						</p>
					</div>
				</div>
			{/if}
		</Section>
	{/if}
</div>

<!-- One dialog serves both stacks. -->
<Modal
	open={selected !== null}
	title={selected?.name ?? ''}
	subtitle={selected?.subtitle ?? ''}
	class={selectedDevice === 'phone' ? 'theme-flutter' : 'theme-svelte'}
	onclose={() => (selected = null)}
>
	{#if selected}
		<div class="case">
			<div class="case-media">
				<DeviceFrame
					variant={selectedDevice}
					src={selected.screenshot}
					fallbackSrc={selected.screenshotFallback}
					alt="{selected.name} screenshot"
					url={selected.detailsLink}
					loading="eager"
				/>
			</div>

			<div class="case-body">
				<dl class="facts">
					<div>
						<dt>Year</dt>
						<dd>{selected.year}</dd>
					</div>
					<div>
						<dt>Platform</dt>
						<dd>{selectedDevice === 'phone' ? 'iOS + Android' : 'Web'}</dd>
					</div>
				</dl>

				<section class="block">
					<h3>Overview</h3>
					<p>{selected.description}</p>
				</section>

				{#if selected.technologies?.length}
					<section class="block">
						<h3>Stack</h3>
						<ul class="chips tech">
							{#each selected.technologies as tech}
								<li>{tech}</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if selected.tags?.length}
					<section class="block">
						<h3>Scope</h3>
						<ul class="chips tags">
							{#each selected.tags as tag}
								<li>{tag}</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if selected.detailsLink && selected.detailsLink !== '#'}
					<a class="source" href={selected.detailsLink} target="_blank" rel="noopener noreferrer">
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.19.7.8.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
						</svg>
						View source on GitHub
					</a>
				{/if}
			</div>
		</div>
	{/if}
</Modal>

<style>
	.projects {
		width: 100%;
	}

	.count {
		font-size: var(--fs-xs);
		font-weight: 500;
		color: var(--text-subtle);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	/* ---- States ---------------------------------------------------------- */

	.state {
		padding: clamp(2rem, 6vw, 3.5rem);
		border: 1px dashed var(--line-strong);
		border-radius: var(--r-lg);
		text-align: center;
		color: var(--text-muted);
	}

	.state h3 {
		margin-bottom: var(--sp-2);
		font-size: var(--fs-h3);
	}

	.retry {
		margin-top: var(--sp-5);
		padding: 0.6rem 1.4rem;
		border-radius: var(--r-pill);
		border: 0;
		background: var(--text);
		color: var(--bg);
		font-weight: 600;
		cursor: pointer;
	}

	.retry:disabled {
		opacity: 0.55;
		cursor: progress;
	}

	.empty-web {
		display: grid;
		gap: clamp(1.5rem, 4vw, 2.5rem);
		align-items: center;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		background: var(--bg-elev-1);
	}

	.empty-frame {
		opacity: 0.55;
	}

	.empty-copy h3 {
		font-size: var(--fs-h3);
		margin-bottom: var(--sp-3);
	}

	.empty-copy p {
		color: var(--text-muted);
		font-size: var(--fs-sm);
	}

	.empty-note {
		margin-top: var(--sp-4);
		padding-top: var(--sp-4);
		border-top: 1px solid var(--line);
		color: var(--text-subtle) !important;
	}

	/* ---- Case dialog ------------------------------------------------------ */

	.case {
		display: grid;
		gap: clamp(1.25rem, 4vw, 2rem);
	}

	.case-media :global(.device) {
		width: min(200px, 55%);
		margin-inline: auto;
	}

	.case-body :global(.device) {
		width: 100%;
	}

	.facts {
		display: flex;
		gap: var(--sp-6);
		padding-bottom: var(--sp-5);
		margin-bottom: var(--sp-5);
		border-bottom: 1px solid var(--line);
	}

	.facts dt {
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: 0.2rem;
	}

	.facts dd {
		font-size: var(--fs-sm);
		font-weight: 500;
	}

	.block + .block {
		margin-top: var(--sp-5);
	}

	.block h3 {
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: var(--sp-3);
	}

	.block p {
		color: var(--text-muted);
		font-size: var(--fs-sm);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		list-style: none;
	}

	.chips li {
		padding: 0.25rem 0.7rem;
		border-radius: var(--r-pill);
		font-size: var(--fs-xs);
		font-weight: 500;
	}

	.chips.tech li {
		background: var(--accent-wash);
		color: var(--accent-ink);
		border: 1px solid var(--accent-edge);
	}

	.chips.tags li {
		color: var(--text-subtle);
		border: 1px solid var(--line);
	}

	.source {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: var(--sp-6);
		padding: 0.65rem 1.2rem;
		border-radius: var(--r-pill);
		background: var(--text);
		color: var(--bg);
		font-size: var(--fs-sm);
		font-weight: 600;
		text-decoration: none;
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.source:hover {
		transform: translateY(-1px);
	}

	@media (min-width: 720px) {
		.empty-web {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
		}

		.case {
			grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr);
			align-items: start;
		}

		.case-media :global(.device) {
			width: 100%;
		}
	}
</style>
