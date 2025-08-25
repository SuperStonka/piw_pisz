import { db } from "@/lib/database"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const menuItemId = searchParams.get("menuItemId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    // Base query for counting total articles
    let countQuery = `
      SELECT COUNT(*) as total
      FROM articles a 
      WHERE a.status = 'published'
    `
    const countParams = []

    // Base query for fetching articles
    let query = `
      SELECT a.*, u.username as author_name 
      FROM articles a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.status = 'published'
    `
    const params = []

    // Add filters to both queries
    if (menuItemId) {
      countQuery += " AND a.menu_item_id = ?"
      query += " AND a.menu_item_id = ?"
      countParams.push(menuItemId)
      params.push(menuItemId)
    } else if (category) {
      countQuery += " AND a.menu_category = ?"
      query += " AND a.menu_category = ?"
      countParams.push(category)
      params.push(category)
    }

    // Get total count
    const [countRows] = await db.execute(countQuery, countParams)
    const total = countRows[0].total

    // Add ordering and pagination to main query
    query += " ORDER BY a.created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const [rows] = await db.execute(query, params)

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return Response.json({ 
      articles: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalArticles: total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return Response.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}
