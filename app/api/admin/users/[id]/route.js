import { NextResponse } from "next/server"
import { User } from "@/lib/models/User"

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

    // Prevent deleting own account
    if (Number.parseInt(params.id) === Number.parseInt(userData.id)) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const result = await User.delete(params.id)
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
