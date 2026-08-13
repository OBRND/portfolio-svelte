import { supabaseServer } from "$lib/server/supabase.js"

/** Technologies that mark a project as web work when `category` is not set. */
const WEB_SIGNALS = /\b(svelte|sveltekit|next\.?js|react|vue|astro|remix|tailwind|node|express)\b/i
/** Technologies that mark a project as mobile work when `category` is not set. */
const MOBILE_SIGNALS = /\b(flutter|dart|android|ios|kotlin|swift|react native)\b/i

/**
 * Normalises a Postgres text[] that may arrive as a real array, a JSON string,
 * or a Postgres array literal, depending on how the row was written.
 */
export function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value !== "string" || !value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String)
  } catch {
    /* not JSON — fall through to the literal form below */
  }

  return value
    .replace(/^[{[]|[}\]]$/g, "")
    .split(",")
    .map((entry) => entry.trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
}

/**
 * Resolves which stack a project belongs to.
 *
 * Prefers the explicit `category` column. Falls back to inspecting the
 * technologies so the site keeps working correctly before that column has been
 * added, and so older rows that predate it are still placed sensibly.
 */
export function resolveCategory(project, technologies) {
  const explicit = typeof project.category === "string" ? project.category.trim().toLowerCase() : ""
  if (explicit === "web" || explicit === "svelte") return "web"
  if (explicit === "flutter" || explicit === "mobile") return "flutter"

  const haystack = technologies.join(" ")
  if (WEB_SIGNALS.test(haystack) && !MOBILE_SIGNALS.test(haystack)) return "web"
  return "flutter"
}

/**
 * Supabase Storage signed URLs carry an expiry in their `token` query param.
 * Most of the stored `image_link` values are signed URLs that have already
 * lapsed, which is why the project images 404.
 *
 * This derives the unsigned public equivalent so the UI has something to retry
 * with. It does not replace the original — if the bucket is still private the
 * public form 404s too, and a URL with a live token should keep being used.
 * Once the `portfolio` bucket is made public, every image resolves through this
 * fallback and stops expiring.
 */
export function publicImageUrl(link) {
  if (typeof link !== "string" || !link.includes("/storage/v1/object/sign/")) return ""
  return link.replace("/storage/v1/object/sign/", "/storage/v1/object/public/").split("?")[0]
}

/** Maps one database row onto the shape the UI consumes. */
export function transformProject(project) {
  const technologies = toList(project.technologies)
  const tags = toList(project.tags)

  return {
    // `orders` is the table's primary key, so it is the only stable id here.
    // The previous array-index id collided once the list was split in two.
    id: project.orders ?? 0,
    orders: project.orders ?? 0,
    name: project.title || "Untitled Project",
    subtitle: project.subtitle || "",
    screenshot: project.image_link || "",
    screenshotFallback: publicImageUrl(project.image_link),
    description: project.description || "No description available.",
    tags,
    technologies,
    category: resolveCategory(project, technologies),
    year: String(project.year ?? new Date().getFullYear()),
    detailsLink: project.source_link || "#",
  }
}

/**
 * Fetches every project, ordered. Returns `{ projects, error }` rather than
 * throwing so the landing page can still render its other sections when the
 * database is unreachable.
 */
export async function loadProjects() {
  if (!supabaseServer) {
    return { projects: [], error: "Database connection not configured." }
  }

  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .order("orders", { ascending: true })

  if (error) {
    console.error("[projects] query failed:", error.message)
    return { projects: [], error: error.message }
  }

  return { projects: (data ?? []).map(transformProject), error: null }
}
