import { NextResponse } from "next/server"

export function middleware(request) {
  // Sprawdź czy to jest ścieżka admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Pomiń stronę logowania
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next()
    }
    
    // Dla innych ścieżek admin, sprawdź sesję w cookies
    const adminSession = request.cookies.get("adminSession")
    
    if (!adminSession) {
      // Przekieruj do logowania
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
