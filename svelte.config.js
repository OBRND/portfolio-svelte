import vercel from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: vercel({
			// Pinned explicitly. Without it the adapter derives the runtime from the
			// local Node version and refuses to build on anything it does not
			// recognise, which breaks `npm run build` on newer Node releases.
			runtime: 'nodejs22.x'
		})
	}
};

export default config;
