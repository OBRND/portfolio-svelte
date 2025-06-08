import { supabaseServer } from "$lib/server/supabase.js"
import { json, error } from "@sveltejs/kit"

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    console.log("API: Starting to fetch projects...")
    console.log("API: Supabase URL:", process.env.PUBLIC_SUPABASE_URL ? "Set" : "Not set")

    // Check if Supabase is properly configured
    if (!supabaseServer) {
      console.error("Supabase client not initialized")
      throw error(500, "Database connection not configured")
    }

    // First, let's try to list all tables to see what's available
    console.log("API: Testing database connection...")

    // Try different possible table names
    const possibleTableNames = ["projects", "projects_rows", "project", "Project", "Projects"]
    const projects = null
    let successfulTableName = null

    for (const tableName of possibleTableNames) {
      try {
        console.log(`API: Trying table name: ${tableName}`)
        const {
          data,
          error: tableError,
          count,
        } = await supabaseServer.from(tableName).select("*", { count: "exact" }).limit(1) // Just get one row to test

        if (tableError) {
          console.log(`API: Error with table ${tableName}:`, tableError.message)
          continue
        }

        console.log(`API: Table ${tableName} exists! Row count:`, count)
        successfulTableName = tableName
        break
      } catch (e) {
        console.log(`API: Exception with table ${tableName}:`, e.message)
        continue
      }
    }

    if (!successfulTableName) {
      console.error("API: No valid table found")
      throw error(500, "No valid projects table found. Please check your database schema.")
    }

    console.log(`API: Using table: ${successfulTableName}`)

    // Now fetch all projects from the correct table - CHANGED TO ASCENDING ORDER
    const {
      data: allProjects,
      error: supabaseError,
      count,
    } = await supabaseServer
      .from(successfulTableName)
      .select("*", { count: "exact" })
      .order("orders", { ascending: true }) // Changed to ascending order

    console.log("API: Query details:")
    console.log("- Table used:", successfulTableName)
    console.log("- Error:", supabaseError)
    console.log("- Count:", count)
    console.log("- Data length:", allProjects?.length || 0)
    console.log("- First row sample:", allProjects?.[0])

    console.log(
      "API: Projects order check:",
      allProjects.map((p) => ({ title: p.title, orders: p.orders })),
    )

    if (supabaseError) {
      console.error("Supabase query error:", supabaseError)
      throw error(500, `Database query failed: ${supabaseError.message}`)
    }

    if (!allProjects || allProjects.length === 0) {
      console.log("API: No projects found in database")

      // Let's also try without the order clause in case that's causing issues
      console.log("API: Trying query without ORDER BY...")
      const { data: simpleQuery, error: simpleError } = await supabaseServer
        .from(successfulTableName)
        .select("*")
        .limit(5)

      console.log("Simple query result:", simpleQuery?.length || 0, "rows")
      if (simpleError) {
        console.log("Simple query error:", simpleError)
      }

      return json([])
    }

    console.log("API: Successfully found", allProjects.length, "projects")

    // Transform and validate the data
    const transformedProjects = allProjects.map((project, index) => {
      try {
        console.log(`API: Processing project ${index + 1}:`, project.title || "Untitled")

        // Parse JSON strings safely
        let tags = []
        let technologies = []

        if (project.tags) {
          try {
            tags = typeof project.tags === "string" ? JSON.parse(project.tags) : project.tags
          } catch (e) {
            console.warn("Failed to parse tags for project:", project.title, e)
            tags = []
          }
        }

        if (project.technologies) {
          try {
            technologies =
              typeof project.technologies === "string" ? JSON.parse(project.technologies) : project.technologies
          } catch (e) {
            console.warn("Failed to parse technologies for project:", project.title, e)
            technologies = []
          }
        }

        // Format year properly
        const year = project.year ? project.year.toString() : "2024"

        const transformed = {
          id: index + 1,
          name: project.title || "Untitled Project",
          subtitle: project.subtitle || "Project Description",
          screenshot: project.image_link || "/placeholder.svg?height=600&width=300",
          tags: Array.isArray(tags) ? tags : [],
          technologies: Array.isArray(technologies) ? technologies : [],
          description: project.description || "No description available.",
          status: "In Development",
          year: year,
          detailsLink: project.source_link || "#",
          orders: project.orders || 0,
        }

        console.log(`API: Transformed project ${index + 1}:`, transformed.name)
        return transformed
      } catch (parseError) {
        console.error("Error parsing project data:", parseError, project)
        return {
          id: index + 1,
          name: project.title || "Untitled Project",
          subtitle: project.subtitle || "Project Description",
          screenshot: "/placeholder.svg?height=600&width=300",
          tags: [],
          technologies: [],
          description: project.description || "No description available.",
          status: "In Development",
          year: "2024",
          detailsLink: "#",
          orders: 0,
        }
      }
    })

    console.log("API: Successfully transformed", transformedProjects.length, "projects")
    return json(transformedProjects)
  } catch (err) {
    console.error("API error:", err)

    // Return a more specific error message
    if (err.message?.includes("ENOTFOUND") || err.message?.includes("getaddrinfo")) {
      throw error(500, "Cannot connect to database. Please check your internet connection and Supabase configuration.")
    }

    if (err.message?.includes("timeout")) {
      throw error(500, "Database connection timeout. Please try again.")
    }

    throw error(500, `Failed to load projects: ${err.message}`)
  }
}
