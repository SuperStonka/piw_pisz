import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    // Test połączenia do bazy
    const [result] = await db.execute("SELECT 1 as test")
    console.log("Database connection test:", result)
    
    // Sprawdź czy tabela users istnieje
    const [users] = await db.execute("SELECT COUNT(*) as count FROM users")
    console.log("Users count:", users[0])
    
    // Sprawdź czy tabela articles istnieje
    const [articles] = await db.execute("SELECT COUNT(*) as count FROM articles")
    console.log("Articles count:", articles[0])
    
    // Sprawdź czy tabela menu_items istnieje
    const [menuItems] = await db.execute("SELECT COUNT(*) as count FROM menu_items")
    console.log("Menu items count:", menuItems[0])
    
    // Sprawdź czy tabela site_settings istnieje
    const [siteSettings] = await db.execute("SELECT COUNT(*) as count FROM site_settings")
    console.log("Site settings count:", siteSettings[0])
    
    // Sprawdź przykładowe ustawienia
    const [sampleSettings] = await db.execute("SELECT setting_key, setting_value FROM site_settings LIMIT 5")
    console.log("Sample settings:", sampleSettings)
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connection: result[0],
        users: users[0].count,
        articles: articles[0].count,
        menuItems: menuItems[0].count,
        siteSettings: siteSettings[0].count,
        sampleSettings: sampleSettings
      }
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
