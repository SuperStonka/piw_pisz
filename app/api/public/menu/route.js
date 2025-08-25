import { db } from "@/lib/database"

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM menu_items 
      WHERE is_active = 1 
      ORDER BY COALESCE(parent_id, id), sort_order ASC
    `)

    // Build hierarchical structure
    const menuMap = new Map()
    const rootItems = []

    // First pass: create all items (excluding hidden ones)
    rows.forEach(item => {
      if (!item.hidden) {
        menuMap.set(item.id, { ...item, children: [] })
      }
    })

    // Second pass: build hierarchy (only for visible items)
    rows.forEach(item => {
      if (item.hidden) return // Skip hidden items
      
      if (item.parent_id === null) {
        rootItems.push(menuMap.get(item.id))
      } else {
        const parent = menuMap.get(item.parent_id)
        if (parent && !parent.hidden) {
          parent.children.push(menuMap.get(item.id))
        }
      }
    })

    return Response.json({ menuItems: rootItems })
  } catch (error) {
    console.error("Error fetching menu:", error)
    return Response.json({ error: "Failed to fetch menu" }, { status: 500 })
  }
}
