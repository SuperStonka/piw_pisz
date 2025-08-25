import { NextResponse } from "next/server"
import { Article } from "@/lib/models/Article"

export async function POST(request, { params }) {
  try {
    const article = Article.getBySlug(params.slug)
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Increment view count
    Article.incrementViewCount(article.id)

    return NextResponse.json({ message: "View recorded" })
  } catch (error) {
    console.error("Error recording view:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
