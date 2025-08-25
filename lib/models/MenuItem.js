import { db } from "../database.js"

export class MenuItem {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT * FROM menu_items 
      ORDER BY sort_order ASC, title ASC
    `)
    return rows
  }

  static async getActive() {
    const [rows] = await db.execute(`
      SELECT * FROM menu_items 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, title ASC
    `)
    return rows
  }

  static async getById(id) {
    const [rows] = await db.execute(`SELECT * FROM menu_items WHERE id = ?`, [id])
    return rows[0]
  }

  static async getBySlug(slug) {
    const [rows] = await db.execute(`SELECT * FROM menu_items WHERE slug = ?`, [slug])
    return rows[0]
  }

  static async create(data) {
    const { title, slug, parent_id, sort_order, is_active, display_mode, show_excerpts, hidden } = data
    const [result] = await db.execute(
      `
      INSERT INTO menu_items (title, slug, parent_id, sort_order, is_active, display_mode, show_excerpts, hidden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [title, slug, parent_id, sort_order, is_active, display_mode || 'single', show_excerpts || false, hidden || false],
    )
    return result.insertId
  }

  static async update(id, data) {
    const { title, slug, parent_id, sort_order, is_active, display_mode, show_excerpts, hidden } = data
    const [result] = await db.execute(
      `
      UPDATE menu_items 
      SET title = ?, slug = ?, parent_id = ?, sort_order = ?, is_active = ?, 
          display_mode = ?, show_excerpts = ?, hidden = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [title, slug, parent_id, sort_order, is_active, display_mode, show_excerpts, hidden, id],
    )
    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await db.execute(`DELETE FROM menu_items WHERE id = ?`, [id])
    return result.affectedRows > 0
  }

  static async updateSortOrder(items) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      for (const { id, sort_order } of items) {
        await connection.execute(`UPDATE menu_items SET sort_order = ? WHERE id = ?`, [sort_order, id])
      }

      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async toggleHidden(id) {
    const [result] = await db.execute(
      `UPDATE menu_items SET hidden = NOT hidden, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    )
    return result.affectedRows > 0
  }

  static async setHidden(id, hidden) {
    const [result] = await db.execute(
      `UPDATE menu_items SET hidden = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [hidden, id]
    )
    return result.affectedRows > 0
  }
}
