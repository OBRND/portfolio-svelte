import { supabaseServer } from "$lib/server/supabase.js"
import { error, fail } from "@sveltejs/kit"

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    console.log("Admin: Loading projects...")

    // Fetch all projects
    const { data: projects, error: supabaseError } = await supabaseServer
      .from("projects")
      .select("*")
      .order("orders", { ascending: false }) // Assuming 'orders' is for sorting display

    if (supabaseError) {
      console.error("Admin: Supabase error:", supabaseError)
      throw error(500, `Failed to fetch projects: ${supabaseError.message}`)
    }

    // Processed projects for client-side use.
    // Assign a temporary ID (like `temp-0`) only if the project genuinely lacks a database ID,
    // which typically indicates a new, unsaved item. For existing items, use their actual DB ID.
    const processedProjects = (projects || []).map((project, index) => ({
      ...project,
      // Ensure 'id' is always present for client-side keys.
      // If project.id from DB is null/undefined, it's a new item on the client.
      id: project.id || `temp-${index}`, 
    }))

    console.log(`Admin: Loaded ${processedProjects.length} projects`)

    return {
      projects: processedProjects,
      tableName: "projects", // Assuming "projects" is the table name
    }
  } catch (err) {
    console.error("Admin: Load error:", err)
    throw error(500, `Failed to load admin page: ${err.message}`)
  }
}

export const actions = {
  create: async ({ request }) => {
    try {
      const formData = await request.formData()

      // Extract and validate form data
      const title = formData.get("title")?.toString().trim()
      const subtitle = formData.get("subtitle")?.toString().trim()
      const description = formData.get("description")?.toString().trim()
      const image_link = formData.get("image_link")?.toString().trim()
      const source_link = formData.get("source_link")?.toString().trim()
      // Use Number() for more robust parsing, falls back to NaN if invalid
      const year = Number(formData.get("year")?.toString() || new Date().getFullYear().toString())
      const orders = Number(formData.get("orders")?.toString() || "0")

      // Parse arrays (assuming TEXT[] in Supabase, so no JSON.stringify here)
      const tagsInput = formData.get("tags")?.toString().trim() || ""
      const techInput = formData.get("technologies")?.toString().trim() || ""

      const tags = tagsInput
        ? tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : []
      const technologies = techInput
        ? techInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : []

      // Basic validation for title and year
      if (!title) {
        return fail(400, { error: true, message: "Title is required." })
      }
      if (isNaN(year)) {
        return fail(400, { error: true, message: "Year must be a valid number." })
      }
      if (isNaN(orders)) {
        return fail(400, { error: true, message: "Orders must be a valid number." })
      }

      // Insert new project
      const { data, error: insertError } = await supabaseServer
        .from('projects')
        .insert({
          title,
          subtitle: subtitle || null,
          description: description || null,
          image_link: image_link || null,
          source_link: source_link || null,
          year,
          orders,
          // If tags/technologies are TEXT[], pass them as JS arrays directly
          tags: tags,
          technologies: technologies,
        })
        .select()

      if (insertError) {
        console.error("Create error:", insertError)
        return fail(500, { error: true, message: `Failed to create project: ${insertError.message}` })
      }

      console.log("Project created successfully:", data)
      return { success: true, message: "Project created successfully!", project: data[0] }
    } catch (err) {
      console.error("Create action error:", err)
      return fail(500, { error: true, message: `An unexpected error occurred: ${err.message}` })
    }
  },

  update: async ({ request }) => {
    try {
      const formData = await request.formData()

      const id = formData.get("id")?.toString() // This 'id' must be the actual database primary key
      const title = formData.get("title")?.toString().trim()
      const subtitle = formData.get("subtitle")?.toString().trim()
      const description = formData.get("description")?.toString().trim()
      const image_link = formData.get("image_link")?.toString().trim()
      const source_link = formData.get("source_link")?.toString().trim()
      const year = Number(formData.get("year")?.toString() || new Date().getFullYear().toString())
      const orders = Number(formData.get("orders")?.toString() || "0")

      // Parse arrays (assuming TEXT[] in Supabase, so no JSON.stringify here)
      const tagsInput = formData.get("tags")?.toString().trim() || ""
      const techInput = formData.get("technologies")?.toString().trim() || ""

      const tags = tagsInput
        ? tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : []
      const technologies = techInput
        ? techInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : []

      // Validation
      if (!id || !title) {
        return fail(400, { error: true, message: "Project ID and title are required for update." })
      }
      if (isNaN(year)) {
        return fail(400, { error: true, message: "Year must be a valid number." })
      }
      if (isNaN(orders)) {
        return fail(400, { error: true, message: "Orders must be a valid number." })
      }

      // Crucial Fix: Use the 'id' column (primary key) for the .eq() filter
      // Ensure the 'id' being passed is the actual database ID, not a 'temp-X' string.
      // If your 'id' column is UUID, ensure 'id' is a valid UUID string.
      // If your 'id' column is integer, ensure 'id' is parseable as an integer.
      let filterId = id;
      // If your database 'id' column is an integer, and you are passing 'temp-X' strings,
      // you need to ensure the client-side logic correctly handles new vs. existing projects.
      // For existing projects, 'id' MUST be the actual integer ID from the DB.
      if (id.startsWith('temp-')) {
          // This block should ideally not be reached if client-side logic is correct,
          // where 'temp-X' IDs are only for newly added, unsaved items that go to 'create'.
          // If you intend to update by 'orders' for some reason and 'orders' is also unique:
          // filterId = orders; // <-- Only if `orders` is guaranteed unique and the intended update key.
          // For now, assuming `id` is primary key and integer/uuid.
          console.warn(`Attempted to update with temporary ID: ${id}. This should be caught client-side or routed to 'create'.`);
          return fail(400, { error: true, message: "Cannot update unsaved project. Please ensure project has a valid ID." });
      }


      const { data, error: updateError } = await supabaseServer
        .from("projects")
        .update({
          title,
          subtitle: subtitle || null,
          description: description || null,
          image_link: image_link || null,
          source_link: source_link || null,
          year,
          orders,
          // If tags/technologies are TEXT[], pass them as JS arrays directly
          tags: tags,
          technologies: technologies,
        })
        .eq("id", filterId) // FIX: Changed 'orders' to 'id' here
        .select()

      if (updateError) {
        console.error("Update error:", updateError)
        return fail(500, { error: true, message: `Failed to update project: ${updateError.message}` })
      }

      if (!data || data.length === 0) {
        return fail(404, { error: true, message: `Project not found or no changes applied for ID: ${id}` })
      }

      console.log("Project updated successfully:", data)
      return { success: true, message: "Project updated successfully!", project: data[0] }
    } catch (err) {
      console.error("Update action error:", err)
      return fail(500, { error: true, message: `An unexpected error occurred: ${err.message}` })
    }
  },

  delete: async ({ request }) => {
    try {
      const formData = await request.formData()
      const id = formData.get("id")?.toString()

      if (!id) {
        return fail(400, { error: true, message: "Project ID is required for deletion." })
      }

      // Delete project
      const { data, error: deleteError } = await supabaseServer.from("projects").delete().eq("id", id).select()

      if (deleteError) {
        console.error("Delete error:", deleteError)
        return fail(500, { error: true, message: `Failed to delete project: ${deleteError.message}` })
      }

      if (!data || data.length === 0) {
        return fail(404, { error: true, message: `Project not found for ID: ${id}` })
      }

      console.log("Project deleted successfully:", data)
      return { success: true, message: "Project deleted successfully!" }
    } catch (err) {
      console.error("Delete action error:", err)
      return fail(500, { error: true, message: `An unexpected error occurred: ${err.message}` })
    }
  },
}