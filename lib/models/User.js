import { db } from "../database.js"
import bcrypt from "bcryptjs"

export class User {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT id, username, imie, nazwisko, email, role, created_at, updated_at 
      FROM users ORDER BY created_at DESC
    `)
    return rows
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `
      SELECT id, username, imie, nazwisko, email, role, created_at, updated_at 
      FROM users WHERE id = ?
    `,
      [id],
    )
    return rows[0]
  }

  static async getByUsername(username) {
    const [rows] = await db.execute(`SELECT * FROM users WHERE username = ?`, [username])
    return rows[0]
  }

  static async getByEmail(email) {
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email])
    return rows[0]
  }

  static async create(data) {
    const { username, imie, nazwisko, email, password, role = "editor" } = data
    const passwordHash = await bcrypt.hash(password, 12)

    const [result] = await db.execute(
      `
      INSERT INTO users (username, imie, nazwisko, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [username, imie || null, nazwisko || null, email, passwordHash, role],
    )

    return result.insertId
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash)
  }

  static async update(id, data) {
    const { username, imie, nazwisko, email, role } = data
    const [result] = await db.execute(
      `
      UPDATE users 
      SET username = ?, imie = ?, nazwisko = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [username, imie || null, nazwisko || null, email, role, id],
    )

    return result.affectedRows > 0
  }

  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12)
    const [result] = await db.execute(
      `
      UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `,
      [passwordHash, id],
    )

    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await db.execute(`DELETE FROM users WHERE id = ?`, [id])
    return result
  }
}
