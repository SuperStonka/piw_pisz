"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Funkcja do określania aktualnej lokalizacji w CMS
  const getCurrentLocation = (path: string): string => {
    if (path === "/admin") return "Dashboard"
    if (path === "/admin/articles") return "Artykuły"
    if (path === "/admin/analytics") return "Analityka"
    if (path === "/admin/menu") return "Menu"
    if (path === "/admin/settings") return "Ustawienia"
    if (path === "/admin/users") return "Użytkownicy"
    if (path.startsWith("/admin/articles/")) return "Edycja artykułu"
    if (path.startsWith("/admin/menu/")) return "Edycja menu"
    if (path.startsWith("/admin/users/")) return "Edycja użytkownika"
    return "Panel Administracyjny"
  }

  const currentLocation = getCurrentLocation(pathname)

  useEffect(() => {
    // Jeśli jesteś na stronie logowania, nie sprawdzaj sesji
    if (pathname === "/admin/login") {
      setLoading(false)
      return
    }

    // Sprawdź sesję w localStorage
    const adminSession = localStorage.getItem("adminSession")
    
    if (adminSession) {
      try {
        const userData = JSON.parse(adminSession)
        setSession({ user: userData })
        setLoading(false)
      } catch (error) {
        console.error("Error parsing session:", error)
        localStorage.removeItem("adminSession")
        router.push("/admin/login")
        return
      }
    } else {
      // Przekieruj do logowania tylko jeśli nie jesteś już tam
      if (pathname !== "/admin/login") {
        router.push("/admin/login")
      }
      setLoading(false)
      return
    }
  }, [router, pathname])

  const handleSignOut = () => {
    localStorage.removeItem("adminSession")
    // Usuń cookie
    document.cookie = "adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/admin/login")
  }

  // Jeśli jesteś na stronie logowania, pokaż tylko dzieci bez layoutu
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B7CB3] mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-[#2B7CB3] text-white shadow-sm">
        <div className="px-[100px]">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-medium text-white">Panel Administracyjny CMS</h1>
              <p className="text-blue-100 text-sm">PIW Pisz</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white">
                Zalogowany jako: <strong>{session.user?.username}</strong>
              </span>
              <button
                onClick={handleSignOut}
                className="bg-[#1E5A87] hover:bg-[#1E5A87] px-4 py-2 rounded-none text-sm font-medium text-white transition-colors"
              >
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-[100px]">
          {/* Breadcrumbs */}
          <div className="py-2 border-b border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <a href="/admin" className="hover:text-[#2B7CB3] transition-colors">
                Panel Admin
              </a>
              {pathname !== "/admin" && (
                <>
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-[#2B7CB3] font-medium">{currentLocation}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex space-x-8">
            <a 
              href="/admin" 
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                pathname === "/admin" 
                  ? "border-[#2B7CB3] text-[#2B7CB3]" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </a>
            <a
              href="/admin/articles"
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                pathname === "/admin/articles" || pathname.startsWith("/admin/articles/")
                  ? "border-[#2B7CB3] text-[#2B7CB3]" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Artykuły
            </a>
            <a
              href="/admin/analytics"
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                pathname === "/admin/analytics"
                  ? "border-[#2B7CB3] text-[#2B7CB3]" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Analityka
            </a>
            <a
              href="/admin/menu"
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                pathname === "/admin/menu" || pathname.startsWith("/admin/menu/")
                  ? "border-[#2B7CB3] text-[#2B7CB3]" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Menu
            </a>
            <a
              href="/admin/settings"
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                pathname === "/admin/settings"
                  ? "border-[#2B7CB3] text-[#2B7CB3]" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Ustawienia
            </a>
            {session.user?.role === "admin" && (
              <a
                href="/admin/users"
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  pathname === "/admin/users" || pathname.startsWith("/admin/users/")
                    ? "border-[#2B7CB3] text-[#2B7CB3]" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Użytkownicy
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6 px-[100px]">
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>
}
