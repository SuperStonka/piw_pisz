import { NextResponse } from "next/server"
import { Article } from "@/lib/models/Article"

export async function GET(request, { params }) {
  try {
    // Sprawdź sesję w cookies (prosty sposób)
    const adminSession = request.cookies.get("adminSession")
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const versions = await Article.getVersions(params.id)
    return NextResponse.json(versions)
  } catch (error) {
    console.error("Error fetching article versions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
