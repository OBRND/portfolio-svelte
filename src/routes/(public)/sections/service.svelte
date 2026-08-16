<script lang="ts">
	import AnimatedCard from '$lib/components/animatedCards.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { ServiceModalData } from '$lib/components/animatedCards.svelte';

	interface Service {
		title: string;
		description: string;
		animationColor: string;
		shapeType: 'circle' | 'wave' | 'blob' | 'tree' | 'triangle' | 'hexagon';
		modalData: ServiceModalData;
	}

	/**
	 * Copy is written for two readers at once: the card face states the outcome
	 * in one plain line, and the dialog lists the concrete work plus the exact
	 * stack terms that appear in job listings.
	 */
	const servicesData: Service[] = [
		{
			title: 'Cross-Platform Mobile Development',
			description: 'One Flutter codebase, released on both the App Store and Play Store.',
			animationColor: '#0468c9',
			shapeType: 'blob',
			modalData: {
				title: 'Cross-Platform Mobile Development',
				subtitle: 'Production Flutter apps, first commit to store listing.',
				description:
					'I build and release Flutter apps end to end: screen architecture, state management, API and database integration, offline behaviour, testing, and signed releases for both platforms.',
				delivers: [
					'Screen and navigation architecture with Riverpod or Provider state management',
					'REST and Firebase integration, including real-time listeners and pagination',
					'Offline-first local storage with Hive, plus sync and conflict handling',
					'Push notifications, in-app payments and third-party SDK integration',
					'Widget and integration tests, with crash reporting wired up before release',
					'Signed builds, versioning and staged rollout to Google Play and the App Store'
				],
				stack: [
					'Flutter',
					'Dart',
					'Riverpod',
					'Provider',
					'Firebase',
					'Hive',
					'REST APIs',
					'Material 3',
					'Fastlane',
					'GitHub Actions'
				]
			}
		},
		{
			title: 'Web Application Development',
			description: 'Server-rendered SvelteKit apps that load fast and stay crawlable.',
			// Deepened from the raw Svelte orange (#ff3e00): the card floods with
			// this colour on hover and puts white text on it, which needs 4.5:1.
			animationColor: '#d93400',
			shapeType: 'hexagon',
			modalData: {
				title: 'Web Application Development',
				subtitle: 'Full-stack web apps, front end through database.',
				description:
					'SvelteKit applications with server-side rendering, typed data loading, and form actions that work before JavaScript arrives. Backed by Postgres through Supabase and deployed continuously to Vercel.',
				delivers: [
					'Server-side rendering and file-based routing with typed load functions',
					'Progressive-enhancement forms that still submit without client JavaScript',
					'Authentication, session handling and protected route guards',
					'Postgres schema design with row-level security policies',
					'Responsive layouts meeting WCAG 2.1 AA, verified in light and dark themes',
					'Performance tracked against Core Web Vitals budgets'
				],
				stack: [
					'SvelteKit',
					'Svelte 5',
					'TypeScript',
					'SSR',
					'Supabase',
					'PostgreSQL',
					'Vercel',
					'Core Web Vitals',
					'WCAG 2.1 AA'
				]
			}
		},
		{
			title: 'UI/UX & Design Systems',
			description: 'Interfaces designed in Figma and built to actually match the mockup.',
			animationColor: '#0f7a52',
			shapeType: 'circle',
			modalData: {
				title: 'UI/UX & Design Systems',
				subtitle: 'From wireframe to a component library that stays consistent.',
				description:
					'Designing and building the interface as one job, so what ships matches what was approved. Reusable components, a real token system, and the states people usually skip: loading, empty, error and offline.',
				delivers: [
					'Wireframes and high-fidelity prototypes in Figma',
					'Design tokens for colour, type and spacing, shared across light and dark themes',
					'A reusable component library with documented props and states',
					'Loading, empty, error and offline states designed rather than improvised',
					'Accessibility review covering contrast, focus order, keyboard paths and labels',
					'Responsive behaviour specified from 320px upward'
				],
				stack: [
					'Figma',
					'Design tokens',
					'Component libraries',
					'Material 3',
					'Cupertino',
					'Responsive design',
					'WCAG 2.1 AA',
					'Prototyping'
				]
			}
		},
		{
			title: 'Release & Deployment',
			description: 'Automated builds, signed releases and monitored rollouts.',
			animationColor: '#96610a',
			shapeType: 'wave',
			modalData: {
				title: 'Release & Deployment',
				subtitle: 'The path from merged branch to live users.',
				description:
					'Release pipelines that build, test and ship without manual steps, plus the monitoring needed to find out quickly when something breaks in production.',
				delivers: [
					'CI/CD pipelines in GitHub Actions or Codemagic',
					'Automated test and lint gates on every pull request',
					'App signing, versioning and staged rollout across both mobile stores',
					'Preview and production deployments on Vercel',
					'Crash reporting and analytics via Crashlytics, Sentry and Google Analytics',
					'Environment and secret management across staging and production'
				],
				stack: [
					'CI/CD',
					'GitHub Actions',
					'Codemagic',
					'Fastlane',
					'Vercel',
					'Crashlytics',
					'Sentry',
					'Play Console',
					'App Store Connect'
				]
			}
		},
		{
			title: 'Backend & APIs',
			description: 'APIs, authentication and data models that hold up under load.',
			animationColor: '#7b3fbf',
			shapeType: 'triangle',
			modalData: {
				title: 'Backend & APIs',
				subtitle: 'The server side your app depends on.',
				description:
					'The backend an app actually needs: authentication that is safe by default, a data model that will not need rewriting in six months, and APIs that are predictable to consume.',
				delivers: [
					'REST API design with consistent error handling and pagination',
					'Authentication and role-based access control with JWT sessions',
					'Relational schema design, indexing and query optimisation',
					'Real-time features via Firestore listeners or Supabase channels',
					'File and media storage with signed, expiring access',
					'Server-side validation and rate limiting'
				],
				stack: [
					'Node.js',
					'Express',
					'PostgreSQL',
					'Supabase',
					'Firebase',
					'Firestore',
					'MongoDB',
					'JWT',
					'REST',
					'Row-level security'
				]
			}
		},
		{
			title: 'System & Database Design',
			description: 'Architecture decisions made before they get expensive to change.',
			animationColor: '#0d7d8c',
			shapeType: 'tree',
			modalData: {
				title: 'System & Database Design',
				subtitle: 'Planning the system so it survives its own growth.',
				description:
					'The structural work that is cheapest to get right early: how data is modelled, where responsibilities sit, and what happens when traffic multiplies.',
				delivers: [
					'Normalised schema design with a migration strategy',
					'Service boundaries and clear separation of concerns',
					'Caching, pagination and query strategy for scale',
					'Security review covering auth layers, input validation and secret handling',
					'Technical documentation and architecture diagrams',
					'Cost and capacity planning for cloud infrastructure'
				],
				stack: [
					'System design',
					'Data modelling',
					'Migrations',
					'Caching',
					'Scalability',
					'Security review',
					'Cloud architecture',
					'Documentation'
				]
			}
		}
	];
</script>

<Section
	index="03"
	eyebrow="What I deliver"
	title="What I can be hired to do"
	lead="Six areas of work, each described by what actually gets delivered rather than by adjectives. Open any card for the full scope and the stack it runs on."
	fadeOut
	motif="dots"
>
	<div class="card-grid">
		{#each servicesData as service, index}
			<div data-reveal use:reveal={{ y: 26, delay: (index % 3) * 80 }}>
				<AnimatedCard
					title={service.title}
					description={service.description}
					animationColor={service.animationColor}
					shapeType={service.shapeType}
					modalData={service.modalData}
				/>
			</div>
		{/each}
	</div>
</Section>

<style>
	.card-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: clamp(1.25rem, 3vw, 2rem);
	}

	/* Each grid child stretches so cards in a row share a height, which keeps
	   the flooding shape animation reading as one consistent surface. */
	.card-grid > :global(*) {
		display: flex;
	}

	@media (min-width: 700px) {
		.card-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1100px) {
		.card-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
