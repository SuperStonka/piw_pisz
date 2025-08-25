import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Article } from "@/lib/models/Article"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const version = Article.getVersion(params.id, params.version)
    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    return NextResponse.json(version)
  } catch (error) {
    console.error("Error fetching article version:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
