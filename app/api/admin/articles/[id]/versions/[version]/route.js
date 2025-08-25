import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Article } from "@/lib/models/Article"

export async function GET(request, { params }) {
  try {
    // Check admin session from cookies
    const cookieStore = cookies()
    const adminSession = cookieStore.get("adminSession")
    
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, version } = params
    
    const articleVersion = await Article.getVersion(id, version)
    
    if (!articleVersion) {
      return NextResponse.json({ error: "Article version not found" }, { status: 404 })
    }

    return NextResponse.json(articleVersion)
  } catch (error) {
    console.error("Error getting article version:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
