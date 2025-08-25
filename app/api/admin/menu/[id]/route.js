import { NextResponse } from "next/server"
import { MenuItem } from "@/lib/models/MenuItem"

export async function PUT(request, { params }) {
  try {
    // Sprawdź sesję w cookies (prosty sposób)
    const adminSession = request.cookies.get("adminSession")
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parsuj sesję żeby sprawdzić rolę
    let userData
    try {
      userData = JSON.parse(adminSession.value)
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Sprawdź czy użytkownik ma rolę admin
    if (userData.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const data = await request.json()
    const result = await MenuItem.update(params.id, data)

    if (!result) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Menu item updated successfully" })
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Sprawdź sesję w cookies (prosty sposób)
    const adminSession = request.cookies.get("adminSession")
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parsuj sesję żeby sprawdzić rolę
    let userData
    try {
      userData = JSON.parse(adminSession.value)
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Sprawdź czy użytkownik ma rolę admin
    if (userData.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Sprawdź czy pozycja menu ma przypisane artykuły
    const { db } = await import("@/lib/database.js")
    const [articles] = await db.execute(
      "SELECT COUNT(*) as count FROM articles WHERE menu_item_id = ?",
      [params.id]
    )
    
    if (articles[0].count > 0) {
      return NextResponse.json({ 
        error: "Nie można usunąć pozycji menu, która ma przypisane artykuły. Najpierw przenieś lub usuń artykuły." 
      }, { status: 400 })
    }

    const result = await MenuItem.delete(params.id)
    if (!result) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Menu item deleted successfully" })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
