import { db } from "../database.js"

export class Article {
  static async getAll(status = null) {
    let query = `
      SELECT a.*, 
             u.username as author_username,
             u.imie as author_imie,
             u.nazwisko as author_nazwisko,
             COALESCE(a.menu_category, mi.title) as category_name
      FROM articles a 
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN menu_items mi ON a.menu_item_id = mi.id
    `

    if (status) {
      query += ` WHERE a.status = ?`
      const [rows] = await db.execute(query, [status])
      return rows
    }

    const [rows] = await db.execute(query)
    return rows
  }

  static async getBySlug(slug) {
    const [rows] = await db.execute(
      `
      SELECT a.*, 
             u.username as author_username,
             u.imie as author_imie,
             u.nazwisko as author_nazwisko,
             COALESCE(a.menu_category, mi.title) as category_name
      FROM articles a 
      LEFT JOIN users u ON a.created_by = u.id 
      LEFT JOIN menu_items mi ON a.menu_item_id = mi.id
      WHERE a.slug = ?
    `,
      [slug],
    )
    return rows[0]
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `
      SELECT a.*, 
             u.username as author_username,
             u.imie as author_imie,
             u.nazwisko as author_nazwisko,
             COALESCE(a.menu_category, mi.title) as category_name
      FROM articles a 
      LEFT JOIN users u ON a.created_by = u.id 
      LEFT JOIN menu_items mi ON a.menu_item_id = mi.id
      WHERE a.id = ?
    `,
      [id],
    )
    return rows[0]
  }

  static async getByMenuItemId(menuItemId) {
    const [rows] = await db.execute(
      `
      SELECT a.*, 
             u.username as author_username,
             u.imie as author_imie,
             u.nazwisko as author_nazwisko,
             COALESCE(a.menu_category, mi.title) as category_name
      FROM articles a 
      LEFT JOIN users u ON a.created_by = u.id 
      LEFT JOIN menu_items mi ON a.menu_item_id = mi.id
      WHERE a.menu_item_id = ?
    `,
      [menuItemId],
    )
    return rows
  }

  static async create(data) {
    const { title, slug, content, excerpt, status, menu_category, responsible_person, created_by, menu_item_id, created_at } = data

    const [result] = await db.execute(
      `
      INSERT INTO articles (title, slug, content, excerpt, status, menu_category, responsible_person, created_by, menu_item_id, published_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        title,
        slug,
        content,
        excerpt,
        status,
        menu_category || null,
        responsible_person || null,
        created_by,
        menu_item_id || null,
        status === "published" ? new Date() : null,
        created_at ? new Date(created_at) : new Date(),
      ],
    )

    // Create initial version
    await this.createVersion(result.insertId, {
      title,
      content,
      excerpt,
      updated_by: created_by,
      change_summary: "Initial version",
    })

    return result.insertId
  }

  static async update(id, data, updated_by) {
    const { title, slug, content, excerpt, status, responsible_person, menu_item_id, change_summary } = data

    // Get current version number
    const [versionRows] = await db.execute(
      `
      SELECT MAX(version_number) as max_version FROM article_versions WHERE article_id = ?
    `,
      [id],
    )

    const newVersionNumber = (versionRows[0]?.max_version || 0) + 1

    // Update article
    const [result] = await db.execute(
      `
      UPDATE articles 
      SET title = ?, slug = ?, content = ?, excerpt = ?, status = ?, 
          responsible_person = ?, menu_item_id = ?, updated_at = CURRENT_TIMESTAMP,
          published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END
      WHERE id = ?
    `,
      [title, slug, content, excerpt, status, responsible_person, menu_item_id, status, id],
    )

    // Create new version
    await this.createVersion(id, {
      title,
      content,
      excerpt,
      updated_by,
      change_summary: change_summary || "Article updated",
      version_number: newVersionNumber,
    })

    return result.affectedRows > 0
  }

  static async createVersion(articleId, data) {
    const { title, content, excerpt, updated_by, change_summary, version_number } = data

    // Get next version number if not provided
    let versionNum = version_number
    if (!versionNum) {
      const [versionRows] = await db.execute(
        `
        SELECT MAX(version_number) as max_version FROM article_versions WHERE article_id = ?
      `,
        [articleId],
      )
      versionNum = (versionRows[0]?.max_version || 0) + 1
    }

    const [result] = await db.execute(
      `
      INSERT INTO article_versions (article_id, version_number, title, content, excerpt, updated_by, change_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [articleId, versionNum, title, content, excerpt, updated_by, change_summary],
    )

    return result.insertId
  }

  static async getVersions(articleId) {
    const [rows] = await db.execute(
      `
      SELECT av.*, u.username as updated_by_name
      FROM article_versions av
      LEFT JOIN users u ON av.updated_by = u.id
      WHERE av.article_id = ?
      ORDER BY av.version_number DESC
    `,
      [articleId],
    )
    return rows
  }

  static async getVersion(articleId, versionNumber) {
    const [rows] = await db.execute(
      `
      SELECT av.*, u.username as updated_by_name
      FROM article_versions av
      LEFT JOIN users u ON av.updated_by = u.id
      WHERE av.article_id = ? AND av.version_number = ?
    `,
      [articleId, versionNumber],
    )
    return rows[0]
  }

  static async incrementViewCount(id) {
    const [result] = await db.execute(
      `
      UPDATE articles SET view_count = view_count + 1 WHERE id = ?
    `,
      [id],
    )
    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await db.execute(`DELETE FROM articles WHERE id = ?`, [id])
    return result.affectedRows > 0
  }

  static async getByMenuCategory(category) {
    const [rows] = await db.execute(
      `
      SELECT a.*, u.username as author_name 
      FROM articles a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.menu_category = ? AND a.status = 'published'
      ORDER BY a.updated_at DESC
    `,
      [category],
    )
    return rows
  }

  static async getByMenuItemId(menuItemId) {
    const [rows] = await db.execute(
      `
      SELECT a.*, u.username as author_name 
      FROM articles a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.menu_item_id = ? AND a.status = 'published'
      ORDER BY a.updated_at DESC
    `,
      [menuItemId],
    )
    return rows
  }
}
