import { db } from "../database.js"

export class SiteSetting {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT ss.*, u.username as updated_by_name
      FROM site_settings ss
      LEFT JOIN users u ON ss.updated_by = u.id
      ORDER BY ss.setting_key ASC
    `)
    return rows
  }

  static async get(key) {
    const [rows] = await db.execute(
      `
      SELECT * FROM site_settings WHERE setting_key = ?
    `,
      [key],
    )
    return rows[0]
  }

  static async getValue(key) {
    const setting = await this.get(key)
    return setting ? setting.setting_value : null
  }

  static async set(key, value, type = "text", updated_by = null) {
    const [result] = await db.execute(
      `
      INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_by, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        setting_type = VALUES(setting_type),
        updated_by = VALUES(updated_by),
        updated_at = CURRENT_TIMESTAMP
    `,
      [key, value, type, updated_by],
    )
    return result.affectedRows > 0
  }

  static async update(key, value, updated_by = null) {
    const [result] = await db.execute(
      `
      UPDATE site_settings 
      SET setting_value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ?
    `,
      [value, updated_by, key],
    )
    return result.affectedRows > 0
  }

  static async delete(key) {
    const [result] = await db.execute(`DELETE FROM site_settings WHERE setting_key = ?`, [key])
    return result.affectedRows > 0
  }

  static async getContactInfo() {
    const keys = ["contact_address", "contact_phone", "office_hours"]
    const result = {}

    for (const key of keys) {
      result[key] = await this.getValue(key)
    }

    return result
  }

  static async getSiteInfo() {
    const keys = ["site_title", "site_subtitle"]
    const result = {}

    for (const key of keys) {
      result[key] = await this.getValue(key)
    }

    return result
  }
}
