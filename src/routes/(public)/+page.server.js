import { loadProjects } from "$lib/server/projects.js"

/**
 * Projects were previously fetched in `onMount`, which meant the section
 * painted "Loading projects..." on every visit and crawlers never saw the work
 * at all. Loading them here server-renders the stacks into the initial HTML.
 *
 * @type {import('./$types').PageServerLoad}
 */
export async function load() {
  const { projects, error } = await loadProjects()
  return { projects, projectsError: error }
}
