import { NextResponse } from "next/server"
import { User } from "@/lib/models/User"

export async function GET(request) {
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

    const users = await User.getAll()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
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
    const result = await User.create(data)

    return NextResponse.json({ id: result.insertId, message: "User created successfully" })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
