import { db } from "@/lib/database"

export async function GET() {
  try {
    const settings = {}
    const [rows] = await db.execute("SELECT setting_key, setting_value FROM site_settings")

    rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value
    })

    return Response.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}
