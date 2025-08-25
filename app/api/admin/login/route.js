import { NextResponse } from "next/server"
import { simpleAuth } from "@/lib/auth.js"

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Nazwa użytkownika i hasło są wymagane" 
      }, { status: 400 })
    }

    const result = await simpleAuth.authenticate(username, password)

    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Wystąpił błąd podczas logowania" 
    }, { status: 500 })
  }
}
