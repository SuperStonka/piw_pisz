import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request) {
  try {
    // Sprawdź sesję w cookies (prosty sposób)
    const adminSession = request.cookies.get("adminSession")
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get article statistics
    const [articleStatsRows] = await db.execute(`
      SELECT 
        COUNT(*) as total_articles,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_articles,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_articles,
        SUM(view_count) as total_views,
        AVG(view_count) as avg_views
      FROM articles
    `)
    const articleStats = articleStatsRows[0]

    // Get most viewed articles
    const [mostViewed] = await db.execute(`
      SELECT title, slug, view_count, updated_at
      FROM articles 
      WHERE status = 'published'
      ORDER BY view_count DESC 
      LIMIT 10
    `)

    // Get recent articles
    const [recentArticles] = await db.execute(`
      SELECT a.title, a.slug, a.status, a.created_at, u.username as author_name
      FROM articles a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC 
      LIMIT 10
    `)

    // Get articles by menu item
    const [categoryStats] = await db.execute(`
      SELECT 
        COALESCE(mi.title, 'Bez kategorii') as menu_category,
        COUNT(a.id) as count,
        SUM(COALESCE(a.view_count, 0)) as total_views
      FROM menu_items mi
      LEFT JOIN articles a ON mi.id = a.menu_item_id
      GROUP BY mi.id, mi.title
      ORDER BY count DESC
    `)

    // Get articles without menu item
    const [articlesWithoutCategory] = await db.execute(`
      SELECT 
        'Bez kategorii' as menu_category,
        COUNT(*) as count,
        SUM(view_count) as total_views
      FROM articles 
      WHERE menu_item_id IS NULL
    `)

    // Combine category stats with articles without category
    let finalCategoryStats = [...categoryStats]
    if (articlesWithoutCategory[0] && articlesWithoutCategory[0].count > 0) {
      finalCategoryStats.push(articlesWithoutCategory[0])
    }

    // Get monthly article creation stats
    const [monthlyStats] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as articles_created,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as articles_published
      FROM articles 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `)

    // Get user activity stats
    const [userStats] = await db.execute(`
      SELECT 
        u.username,
        COUNT(a.id) as articles_created,
        SUM(a.view_count) as total_views,
        MAX(a.updated_at) as last_activity
      FROM users u
      LEFT JOIN articles a ON u.id = a.created_by
      GROUP BY u.id, u.username
      ORDER BY articles_created DESC
    `)

    return NextResponse.json({
      articleStats,
      mostViewed,
      recentArticles,
      categoryStats: finalCategoryStats,
      monthlyStats,
      userStats,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
