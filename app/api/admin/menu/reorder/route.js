import { NextResponse } from "next/server"
import { MenuItem } from "@/lib/models/MenuItem"

export async function PUT(request) {
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

    const items = await request.json()

    // Update sort order for all items
    await MenuItem.updateSortOrder(items)

    return NextResponse.json({ message: "Menu order updated successfully" })
  } catch (error) {
    console.error("Error updating menu order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
