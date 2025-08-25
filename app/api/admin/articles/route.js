import { NextResponse } from "next/server"
import { Article } from "@/lib/models/Article"

export async function GET(request) {
  try {
    // Sprawdź sesję w cookies (prosty sposób)
    const adminSession = request.cookies.get("adminSession")
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz parametry query string
    const { searchParams } = new URL(request.url)
    const menuItemId = searchParams.get('menu_item_id')
    const status = searchParams.get('status')

    let articles
    if (menuItemId) {
      // Filtruj po menu_item_id
      articles = await Article.getByMenuItemId(Number(menuItemId))
    } else if (status) {
      // Filtruj po statusie
      articles = await Article.getAll(status)
    } else {
      // Pobierz wszystkie artykuły
      articles = await Article.getAll()
    }

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Error fetching articles:", error)
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

    // Parsuj sesję żeby dostać ID użytkownika
    let userData
    try {
      userData = JSON.parse(adminSession.value)
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const data = await request.json()
    const articleId = await Article.create({
      ...data,
      created_by: Number.parseInt(userData.id),
    })

    return NextResponse.json({ id: articleId, message: "Article created successfully" })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
