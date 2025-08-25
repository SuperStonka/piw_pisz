import { db } from "@/lib/database"

export async function GET(request, { params }) {
  try {
    const { slug } = params

    // Get article with author info
    const [articleRows] = await db.execute(`
      SELECT a.*, u.username as author_name
      FROM articles a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.slug = ? AND a.status = 'published'
    `, [slug])

    const article = articleRows[0]

    if (!article) {
      return Response.json({ error: "Article not found" }, { status: 404 })
    }

    // Increment view count
    await db.execute("UPDATE articles SET view_count = view_count + 1 WHERE id = ?", [article.id])
    article.view_count += 1

    // Get article versions for poprzednie wersje
    const [versionRows] = await db.execute(`
      SELECT av.*, u.username as updated_by_name
      FROM article_versions av
      LEFT JOIN users u ON av.updated_by = u.id
      WHERE av.article_id = ?
      ORDER BY av.created_at DESC
    `, [article.id])

    return Response.json({ article, versions: versionRows })
  } catch (error) {
    console.error("Error fetching article:", error)
    return Response.json({ error: "Failed to fetch article" }, { status: 500 })
  }
}
