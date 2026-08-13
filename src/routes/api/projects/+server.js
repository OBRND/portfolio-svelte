import { loadProjects } from "$lib/server/projects.js"
import { json, error } from "@sveltejs/kit"

/**
 * The landing page server-renders projects via `+page.server.js`; this endpoint
 * remains for the client-side "Try again" path when that initial load failed.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET() {
  const { projects, error: loadError } = await loadProjects()

  if (loadError) {
    throw error(500, `Failed to load projects: ${loadError}`)
  }

  return json(projects)
}
