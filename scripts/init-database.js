import { initializeDatabase } from "../lib/database.js"
import { User } from "../lib/models/User.js"

async function initDB() {
  try {
    console.log("Initializing MySQL database...")
    await initializeDatabase()

    // Create default admin user
    const existingAdmin = await User.getByUsername("admin")
    if (!existingAdmin) {
      await User.create({
        username: "admin",
        email: "admin@pisz.piw.gov.pl", // changed email domain from olecko to pisz
        password: "admin123",
        role: "admin",
      })
      console.log("Default admin user created (username: admin, password: admin123)")
    }

    console.log("MySQL database initialized successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  }
}

initDB()
