import mysql from "mysql2/promise"

// MySQL connection configuration
const dbConfig = {
  host: "arstudio.atthost24.pl",
  user: "9518_piwpisz",
  password: "Rs75Nz#$UB65@",
  database: "9518_piwpisz",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Initialize database tables
export async function initializeDatabase() {
  const connection = await pool.getConnection()

  try {
    // Users table for CMS authentication
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Articles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        menu_category VARCHAR(255),
        responsible_person VARCHAR(255),
        created_by INT,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        view_count INT DEFAULT 0,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Article versions for tracking changes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS article_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        version_number INT NOT NULL,
        title TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        updated_by INT,
        change_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (updated_by) REFERENCES users(id),
        UNIQUE KEY unique_version (article_id, version_number)
      )
    `)

    // Menu items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        parent_id INT,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES menu_items(id)
      )
    `)

    // Site settings table for contact info, footer data, etc.
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `)

    // Insert default menu items
    const menuItems = [
      "Dane podstawowe",
      "Informacje i komunikaty",
      "Struktura organizacyjna",
      "Sprawozdania finansowe",
      "Plan urzędowej kontroli",
      "Kontrola zarządca",
      "Zamówienia publiczne",
      "Ogłoszenia o naborze",
      "Ogłoszenia inne",
      "RODO",
      "Wzory Dokumentów",
      "Zgłoszenie padnięcia zwierzęcia - formularz online",
      "Zgłoszenie naruszeń prawa",
      "Elektroniczna Skrzynka Podawcza",
      "WYZNACZENIA",
    ]

    for (let index = 0; index < menuItems.length; index++) {
      const item = menuItems[index]
      const slug = item
        .toLowerCase()
        .replace(/ą/g, "a")
        .replace(/ć/g, "c")
        .replace(/ę/g, "e")
        .replace(/ł/g, "l")
        .replace(/ń/g, "n")
        .replace(/ó/g, "o")
        .replace(/ś/g, "s")
        .replace(/ź/g, "z")
        .replace(/ż/g, "z")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      await connection.execute(`INSERT IGNORE INTO menu_items (title, slug, sort_order) VALUES (?, ?, ?)`, [
        item,
        slug,
        index,
      ])
    }

    // Insert default site settings
    const defaultSettings = [
      ["site_title", "Powiatowy Inspektorat Weterynaryjny w Piszu"],
      ["site_subtitle", "Biuletyn Informacji Publicznej"],
      ["contact_address", "ul. Przykładowa 1\n19-400 Pisz"],
      ["contact_phone", "+48 87 520 XX XX"],
      ["office_hours", "poniedziałek, wtorek, czwartek i piątek: 7:00 – 15:00\nśrodę: 8:00 – 16:00"],
    ]

    for (const [key, value] of defaultSettings) {
      await connection.execute(`INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)`, [
        key,
        value,
      ])
    }
  } finally {
    connection.release()
  }
}

// Export the pool as db for compatibility
export default pool
export { pool as db }
