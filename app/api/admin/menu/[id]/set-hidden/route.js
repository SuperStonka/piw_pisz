import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { MenuItem } from "@/lib/models/MenuItem"

export async function PUT(request, { params }) {
  try {
    // Check admin session from cookies
    const cookieStore = cookies()
    const adminSession = cookieStore.get("adminSession")
    
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { hidden } = await request.json()
    
    if (typeof hidden !== "boolean") {
      return NextResponse.json({ error: "Hidden status must be a boolean" }, { status: 400 })
    }

    const result = await MenuItem.setHidden(params.id, hidden)
    
    if (!result) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Menu item hidden status updated successfully",
      hidden: hidden
    })
  } catch (error) {
    console.error("Error setting menu item hidden status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
