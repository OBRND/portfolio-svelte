<script lang="ts">
	import { enhance } from '$app/forms';
	import Section from '$lib/components/ui/Section.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { ripple } from '$lib/actions/ripple';

	let { form } = $props();

	let isSubmitting = $state(false);

	const channels = [
		{
			label: 'Email',
			value: 'obsannew@gmail.com',
			href: 'mailto:obsannew@gmail.com',
			path: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z'
		},
		{
			label: 'Telegram',
			value: '@OBDREAMER',
			href: 'https://t.me/OBDREAMER',
			path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'
		},
		{
			label: 'Phone',
			value: '+251 940 844 097',
			href: 'tel:+251940844097',
			path: 'M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.05-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.05z'
		}
	];
</script>

<Section
	index="06"
	eyebrow="Get in touch"
	title="Let's talk about what you're building"
	lead="Open to full-time roles, contract work and freelance projects. The fastest route is email or Telegram, I answer both within a day."
	tone="inset"
>
	<div class="grid">
		<!-- Direct channels first: they always work, regardless of the form. -->
		<aside class="channels" data-reveal use:reveal={{ y: 22 }}>
			<h3 class="block-label">Reach me directly</h3>

			<ul class="channel-list">
				{#each channels as channel}
					<li>
						<a href={channel.href} target={channel.href.startsWith('http') ? '_blank' : null} rel="noopener noreferrer">
							<span class="icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
									<path d={channel.path} />
								</svg>
							</span>
							<span class="channel-text">
								<span class="channel-label">{channel.label}</span>
								<span class="channel-value">{channel.value}</span>
							</span>
							<svg class="chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M7 17 17 7M9 7h8v8" />
							</svg>
						</a>
					</li>
				{/each}
			</ul>

			<div class="locale">
				<h3 class="block-label">Based in</h3>
				<p>Addis Ababa, Ethiopia, <abbr title="East Africa Time, UTC+3">EAT (UTC+3)</abbr></p>
				<p class="locale-note">Working remotely with teams across other time zones.</p>
			</div>
		</aside>

		<div class="form-card" data-reveal use:reveal={{ y: 26, delay: 80 }}>
			{#if form?.success}
				<div class="alert success" role="status">
					<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="m5 13 4 4L19 7" />
					</svg>
					<p><strong>Message sent.</strong> {form.message || "I'll get back to you shortly."}</p>
				</div>
			{/if}

			{#if form?.error}
				<div class="alert error" role="alert">
					<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="12" cy="12" r="9" />
						<path d="M12 8v5M12 16.5v.01" />
					</svg>
					<p>
						<strong>Couldn't send that.</strong>
						{form.message || 'Please try again, or email me directly at obsannew@gmail.com.'}
					</p>
				</div>
			{/if}

			<form
				class="contact-form"
				method="POST"
				action="/sections/contact"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
			>
				<div class="field">
					<label for="name">Name <span aria-hidden="true">*</span></label>
					<input id="name" name="name" type="text" autocomplete="name" required placeholder="Your name" />
				</div>

				<div class="field">
					<label for="email-address">Email <span aria-hidden="true">*</span></label>
					<input
						id="email-address"
						name="email"
						type="email"
						autocomplete="email"
						required
						placeholder="you@company.com"
					/>
				</div>

				<div class="field full">
					<label for="subject">Subject <span aria-hidden="true">*</span></label>
					<input id="subject" name="subject" type="text" required placeholder="Role, project or question" />
				</div>

				<div class="field full">
					<label for="message">Message <span aria-hidden="true">*</span></label>
					<textarea id="message" name="message" rows="6" required placeholder="A couple of lines about what you have in mind."></textarea>
				</div>

				<div class="field full actions">
					<button type="submit" class="submit" disabled={isSubmitting} use:ripple>
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="m3 3 3 9-3 9 19-9Z" />
							<path d="M6 12h13" />
						</svg>
						{isSubmitting ? 'Sending…' : 'Send message'}
					</button>
					<p class="required-note">All fields required.</p>
				</div>
			</form>
		</div>
	</div>
</Section>

<style>
	.grid {
		display: grid;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: start;
	}

	.block-label {
		font-family: var(--font-body);
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: var(--sp-4);
	}

	/* ---- Channels -------------------------------------------------------- */

	.channel-list {
		list-style: none;
		display: grid;
		gap: 0.5rem;
	}

	.channel-list a {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--sp-4);
		padding: 0.85rem 1rem;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--bg-elev-1);
		text-decoration: none;
		transition:
			border-color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}

	.channel-list a:hover {
		border-color: var(--accent-edge);
		transform: translateX(3px);
	}

	.icon {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: var(--r-sm);
		background: var(--accent-wash);
		color: var(--accent-ink);
	}

	.channel-text {
		display: grid;
		min-width: 0;
	}

	.channel-label {
		font-size: var(--fs-xs);
		color: var(--text-subtle);
	}

	.channel-value {
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chevron {
		color: var(--text-subtle);
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.channel-list a:hover .chevron {
		transform: translate(2px, -2px);
		color: var(--accent);
	}

	.locale {
		margin-top: var(--sp-7);
		padding-top: var(--sp-6);
		border-top: 1px solid var(--line);
	}

	.locale p {
		font-size: var(--fs-sm);
		color: var(--text-muted);
	}

	.locale abbr {
		text-decoration: none;
		border-bottom: 1px dotted var(--line-strong);
		cursor: help;
	}

	.locale-note {
		margin-top: 0.35rem;
		color: var(--text-subtle) !important;
		font-size: var(--fs-xs) !important;
	}

	/* ---- Form ------------------------------------------------------------ */

	.form-card {
		padding: clamp(1.5rem, 4vw, 2.25rem);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		background: var(--bg-elev-1);
		box-shadow: var(--shadow-sm);
	}

	.alert {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--sp-3);
		align-items: start;
		padding: 0.9rem 1rem;
		margin-bottom: var(--sp-5);
		border-radius: var(--r-sm);
		border: 1px solid;
		font-size: var(--fs-sm);
	}

	.alert svg {
		margin-top: 0.15rem;
	}

	.alert.success {
		background: var(--ok-wash);
		border-color: var(--ok-edge);
		color: var(--ok);
	}

	.alert.error {
		background: var(--danger-wash);
		border-color: var(--danger-edge);
		color: var(--danger);
	}

	.alert p {
		color: var(--text);
	}

	.alert strong {
		font-weight: 600;
	}

	.contact-form {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--sp-4);
	}

	.field {
		display: grid;
		gap: 0.4rem;
		min-width: 0;
	}

	.field label {
		font-size: var(--fs-xs);
		font-weight: 600;
		color: var(--text-muted);
	}

	.field label span {
		color: var(--accent-ink);
	}

	.field input,
	.field textarea {
		width: 100%;
		padding: 0.7rem 0.85rem;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--bg);
		color: var(--text);
		font-size: var(--fs-sm);
		font-family: inherit;
		transition:
			border-color var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}

	.field textarea {
		resize: vertical;
		min-height: 8rem;
	}

	.field input::placeholder,
	.field textarea::placeholder {
		color: var(--text-subtle);
	}

	.field input:focus-visible,
	.field textarea:focus-visible {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-wash);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-4);
		margin-top: var(--sp-2);
	}

	.submit {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.4rem;
		border: 0;
		border-radius: var(--r-pill);
		background: var(--text);
		color: var(--bg);
		font-size: var(--fs-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			transform var(--dur-fast) var(--ease-out),
			opacity var(--dur-fast) var(--ease-out);
	}

	.submit:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.submit:active:not(:disabled) {
		transform: translateY(0) scale(0.97);
	}

	.submit:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.submit svg {
		transition: transform var(--dur-base) var(--ease-out);
	}

	.submit:hover:not(:disabled) svg {
		transform: translateX(3px);
	}

	.required-note {
		font-size: var(--fs-xs);
		color: var(--text-subtle);
	}

	/* ---- Layout ---------------------------------------------------------- */

	@media (min-width: 640px) {
		.contact-form {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.field.full {
			grid-column: 1 / -1;
		}
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		}
	}
</style>
