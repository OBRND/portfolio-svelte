<script lang="ts">
	import { enhance } from '$app/forms';
	import { reveal } from '$lib/actions/reveal';
	import { magnetic } from '$lib/actions/magnetic';
	import { progress } from '$lib/motion/scroll';
	import { person, socials } from '$lib/data/site';

	let { form = null }: { form?: { success?: boolean; error?: boolean; message?: string } | null } = $props();

	/**
	 * The outcome of the last send. This section is rendered on the home page
	 * but posts to its own route's action, and SvelteKit only fills the `form`
	 * prop when the action belongs to the page being viewed — so on the home
	 * page the result has to be read off the response here instead. `form`
	 * still covers the no-JS path, which lands on /sections/contact.
	 */
	let sent = $state<{ success?: boolean; error?: boolean; message?: string } | null>(null);
	const outcome = $derived(sent ?? form);

	let isSubmitting = $state(false);
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;

	// Stamped on the client after hydration, so a cached SSR page cannot hand a
	// stale timestamp to the server's minimum-fill-time spam check.
	let startedAt = $state('');
	$effect(() => {
		startedAt = Date.now().toString();
	});

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(person.email);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1800);
		} catch {
			/* clipboard blocked — the mailto link right beside it still works */
		}
	}

	const marquee = ['Open to full-time', 'Contract', 'Freelance', 'Remote-friendly'];
</script>

<!--
	The page ends on one question and one line to write on. The four boxed
	inputs became a letter: a few ruled lines, large type, nothing else.
-->
<section class="contact" id="contact" use:progress={{ mode: 'view' }} data-section="contact" data-mood="ember">
	<!-- Availability, running across the top; the scroll sets its position. -->
	<div class="ticker" aria-hidden="true">
		<div class="ticker-track">
			{#each [0, 1, 2] as _}
				{#each marquee as item}
					<span>{item}</span><i>✳</i>
				{/each}
			{/each}
		</div>
	</div>
	<p class="u-sr-only">Open to full-time roles, contract work and freelance projects.</p>

	<div class="u-shell">
		<span class="u-label">05 — Contact</span>

		<h2 class="title u-lines" data-reveal use:reveal>
			<span class="u-line"><span>Let's build</span></span>
			<span class="u-line"><span><span class="u-serif">something.</span></span></span>
		</h2>

		<div class="grid">
			<div class="direct" data-reveal use:reveal={{ y: 24 }}>
				<div class="mail">
					<a class="mail-link" href="mailto:{person.email}">{person.email}</a>
					<button type="button" class="copy u-label" onclick={copyEmail} aria-live="polite">
						{copied ? 'Copied' : 'Copy'}
					</button>
				</div>

				<dl class="facts">
					{#each socials.filter((s) => s.label !== 'Email') as social}
						<div>
							<dt class="u-label">{social.label}</dt>
							<dd><a href={social.href} target="_blank" rel="noopener noreferrer">{social.handle} ↗</a></dd>
						</div>
					{/each}
					<div>
						<dt class="u-label">Phone</dt>
						<dd><a href={person.phoneHref}>{person.phone}</a></dd>
					</div>
					<div>
						<dt class="u-label">Based in</dt>
						<dd>{person.city}, {person.country}</dd>
					</div>
				</dl>
			</div>

			<div class="letter" data-reveal use:reveal={{ y: 24, delay: 90 }}>
				{#if outcome?.success}
					<p class="notice ok" role="status">
						<span class="u-serif">Sent.</span>
						{outcome.message || "I'll get back to you shortly."}
					</p>
				{/if}

				{#if outcome?.error}
					<p class="notice bad" role="alert">
						<span class="u-serif">Not sent.</span>
						{outcome.message || `Please try again, or email me directly at ${person.email}.`}
					</p>
				{/if}

				<form
					method="POST"
					action="/sections/contact"
					use:enhance={() => {
						isSubmitting = true;
						sent = null;
						return async ({ result, formElement }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								sent = { success: true, message: String(result.data?.message ?? '') };
								formElement.reset();
							} else if (result.type === 'failure') {
								sent = { error: true, message: String(result.data?.message ?? '') };
							} else {
								sent = { error: true, message: '' };
							}
						};
					}}
				>
					<!-- Spam traps: offscreen rather than display:none, which bots detect. -->
					<div class="hp" aria-hidden="true">
						<label for="company">Company</label>
						<input id="company" name="company" type="text" tabindex="-1" autocomplete="off" />
					</div>
					<input type="hidden" name="started_at" value={startedAt} />

					<div class="field">
						<label for="name" class="u-label">Name</label>
						<input id="name" name="name" type="text" autocomplete="name" required placeholder="Your name" />
					</div>

					<div class="field">
						<label for="email-address" class="u-label">Email</label>
						<input id="email-address" name="email" type="email" autocomplete="email" required placeholder="you@company.com" />
					</div>

					<div class="field wide">
						<label for="subject" class="u-label">About</label>
						<input id="subject" name="subject" type="text" required placeholder="A role, a project, a question" />
					</div>

					<div class="field wide">
						<label for="message" class="u-label">Message</label>
						<textarea id="message" name="message" rows="3" required placeholder="A couple of lines is plenty."></textarea>
					</div>

					<div class="send wide">
						<span use:magnetic={{ strength: 0.2 }}>
							<button type="submit" class="submit" disabled={isSubmitting} data-cursor={isSubmitting ? null : 'Send'}>
								<span>{isSubmitting ? 'Sending…' : 'Send it'}</span>
								<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M7 17 17 7M9 7h8v8" />
								</svg>
							</button>
						</span>
						<p class="u-label">Usually answered within a day.</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>

<style>
	.contact {
		--p: 0;
		position: relative;
		padding-bottom: var(--section-y);
		overflow: hidden;
	}

	/* The sky warms toward the footer's edge. One flat gradient — nothing
	   here moves or is big enough to cost anything. */
	.contact::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: min(46vh, 26rem);
		z-index: -1;
		background: linear-gradient(to top, color-mix(in srgb, var(--ember) 20%, transparent), transparent);
		pointer-events: none;
	}

	/* ---- Ticker ----------------------------------------------------------- */

	.ticker {
		margin-bottom: var(--section-y);
		padding-block: 0.9rem;
		border-block: 1px solid var(--line);
		white-space: nowrap;
		overflow: hidden;
	}

	.ticker-track {
		display: inline-flex;
		align-items: center;
		gap: 1.6rem;
		font-family: var(--font-display);
		font-size: clamp(1.4rem, 3vw, 2.6rem);
		font-weight: 300;
		font-stretch: 80%;
		letter-spacing: -0.04em;
		line-height: 1;
		transform: translate3d(calc(var(--p) * -34%), 0, 0);
		will-change: transform;
	}

	.ticker i {
		font-style: normal;
		font-size: 0.6em;
		color: var(--ember);
	}

	/* ---- Title ------------------------------------------------------------ */

	.title {
		margin-top: var(--sp-5);
		font-size: clamp(3.6rem, 14.5vw, 17rem);
		font-weight: 300;
		font-stretch: 75%;
		line-height: 0.82;
		letter-spacing: -0.03em;
	}

	.title .u-line:last-child {
		text-align: right;
	}

	.title .u-serif {
		font-size: 1.06em;
		color: var(--ember);
	}

	/* ---- Layout ----------------------------------------------------------- */

	.grid {
		display: grid;
		gap: clamp(2.5rem, 6vw, 5rem);
		margin-top: clamp(3rem, 8vw, 7rem);
	}

	/* ---- Direct ----------------------------------------------------------- */

	.mail {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.4rem 1.2rem;
		padding-bottom: var(--sp-5);
		border-bottom: 1px solid var(--line);
	}

	.mail-link {
		font-size: clamp(1.4rem, 3vw, 2.5rem);
		font-weight: 350;
		letter-spacing: -0.04em;
		line-height: 1.1;
		text-decoration: none;
		overflow-wrap: anywhere;
		background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
		transition: background-size var(--dur-slow) var(--ease-out);
	}

	.mail-link:hover {
		background-size: 100% 1px;
	}

	.copy {
		min-height: 32px;
		padding: 0.3rem 0.8rem;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-pill);
		color: var(--text);
		transition:
			background-color var(--dur-base) var(--ease-out),
			color var(--dur-base) var(--ease-out);
	}

	.copy:hover {
		background: var(--text);
		color: var(--bg);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--sp-5);
		margin-top: var(--sp-5);
	}

	.facts dd {
		margin-top: 0.3rem;
		font-size: var(--fs-body);
		letter-spacing: -0.015em;
	}

	.facts a {
		text-decoration: none;
		background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
		transition: background-size var(--dur-slow) var(--ease-out);
	}

	.facts a:hover {
		background-size: 100% 1px;
	}

	/* ---- Letter ----------------------------------------------------------- */

	.notice {
		margin-bottom: var(--sp-5);
		padding: var(--sp-4) var(--sp-5);
		border-radius: var(--r-md);
		border: 1px solid;
		font-size: var(--fs-body);
		line-height: 1.35;
	}

	.notice .u-serif {
		font-size: 1.5em;
		margin-right: 0.3rem;
	}

	.notice.ok {
		border-color: var(--ok-edge);
		background: var(--ok-wash);
	}

	.notice.ok .u-serif {
		color: var(--ok);
	}

	.notice.bad {
		border-color: var(--danger-edge);
		background: var(--danger-wash);
	}

	.notice.bad .u-serif {
		color: var(--danger);
	}

	form {
		display: grid;
		gap: var(--sp-5) var(--sp-6);
	}

	/* Honeypot. Out of flow so it takes no grid track, and offscreen instead
	   of display:none so naive bots still fill it in. */
	.hp {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.field {
		position: relative;
		display: grid;
		gap: 0.3rem;
		min-width: 0;
	}

	.field input,
	.field textarea {
		width: 100%;
		padding: 0.35rem 0 0.7rem;
		border: 0;
		border-bottom: 1px solid var(--line-strong);
		border-radius: 0;
		background: transparent;
		color: var(--text);
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2.2vw, 1.9rem);
		font-weight: 350;
		letter-spacing: -0.035em;
		line-height: 1.2;
	}

	.field textarea {
		resize: vertical;
		min-height: 5.5rem;
	}

	.field input::placeholder,
	.field textarea::placeholder {
		color: var(--text-subtle);
		opacity: 0.75;
	}

	/* The rule under each line is drawn in the accent as you write on it. */
	.field::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: var(--ember);
		transform: scaleX(0);
		transform-origin: 0 50%;
		transition: transform var(--dur-slow) var(--ease-out);
		pointer-events: none;
	}

	.field:focus-within::after {
		transform: scaleX(1);
	}

	.field input:focus-visible,
	.field textarea:focus-visible {
		outline: none;
	}

	.field:focus-within label {
		color: var(--ember);
	}

	/* Browser autofill paints its own pale background over a dark ground. */
	.field input:-webkit-autofill {
		-webkit-text-fill-color: var(--text);
		transition: background-color 9999s ease-out;
	}

	.send {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-4) var(--sp-6);
		margin-top: var(--sp-3);
	}

	.send > span {
		display: inline-block;
	}

	.submit {
		display: inline-flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1.15rem 2.2rem;
		border-radius: var(--r-pill);
		background: var(--text);
		color: var(--bg);
		font-family: var(--font-display);
		font-size: clamp(1.2rem, 1.8vw, 1.6rem);
		font-weight: 400;
		letter-spacing: -0.03em;
		line-height: 1;
		transition:
			background-color var(--dur-base) var(--ease-out),
			color var(--dur-base) var(--ease-out);
	}

	.submit:hover:not(:disabled) {
		background: var(--ember);
		color: #07080c;
	}

	.submit svg {
		transition: transform var(--dur-slow) var(--ease-out);
	}

	.submit:hover:not(:disabled) svg {
		transform: translate(3px, -3px);
	}

	.submit:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	@media (min-width: 640px) {
		form {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.wide {
			grid-column: 1 / -1;
		}
	}

	@media (min-width: 980px) {
		.grid {
			grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
			align-items: start;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ticker-track {
			transform: none;
		}

	}
</style>
