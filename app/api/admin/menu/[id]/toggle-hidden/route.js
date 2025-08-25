import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { MenuItem } from "@/lib/models/MenuItem"

export async function POST(request, { params }) {
  try {
    // Check admin session from cookies
    const cookieStore = cookies()
    const adminSession = cookieStore.get("adminSession")
    
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await MenuItem.toggleHidden(params.id)
    
    if (!result) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    // Get updated menu item to return current hidden status
    const menuItem = await MenuItem.getById(params.id)
    
    return NextResponse.json({ 
      message: "Menu item hidden status toggled successfully",
      hidden: menuItem.hidden
    })
  } catch (error) {
    console.error("Error toggling menu item hidden status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
