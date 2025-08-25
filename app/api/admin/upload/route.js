import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const type = formData.get("type") || "file"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Sprawdź czy użytkownik jest zalogowany
    const adminSession = request.cookies.get("adminSession")
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Utwórz katalogi jeśli nie istnieją
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    const typeDir = path.join(uploadDir, type)
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    if (!existsSync(typeDir)) {
      await mkdir(typeDir, { recursive: true })
    }

    // Generuj unikalną nazwę pliku
    const timestamp = Date.now()
    const originalName = file.name
    const extension = path.extname(originalName)
    const fileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(typeDir, fileName)

    // Zapisz plik
    await writeFile(filePath, buffer)

    // Zwróć URL do pliku
    const fileUrl = `/uploads/${type}/${fileName}`

    return NextResponse.json({ 
      url: fileUrl,
      fileName: originalName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
