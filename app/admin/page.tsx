"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
  articleStats: {
    total_articles: number
    published_articles: number
    draft_articles: number
    total_views: number
  }
  recentArticles: Array<{
    title: string
    slug: string
    status: string
    created_at: string
    author_name: string
  }>
}

export default function AdminDashboard() {
  const [session, setSession] = useState(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Pobierz sesję z localStorage
    const adminSession = localStorage.getItem("adminSession")
    if (adminSession) {
      try {
        const userData = JSON.parse(adminSession)
        setSession({ user: userData })
        console.log("Session loaded:", userData)
      } catch (error) {
        console.error("Error parsing session:", error)
        setError("Błąd sesji")
      }
    } else {
      setError("Brak sesji")
    }
    
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      console.log("Fetching dashboard stats...")
      const response = await fetch("/api/admin/analytics")
      console.log("Response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Dashboard data:", data)
        setStats({
          articleStats: data.articleStats,
          recentArticles: data.recentArticles.slice(0, 5), // Show only 5 recent articles
        })
        setError("")
      } else {
        const errorData = await response.json()
        console.error("API error:", errorData)
        setError(`Błąd API: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setError(`Błąd połączenia: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-normal text-gray-900">Dashboard</h1>
          <p className="text-red-600">Błąd: {error}</p>
        </div>
        <Card className="rounded-none">
          <CardContent className="p-6">
            <button 
              onClick={fetchDashboardStats}
              className="bg-[#2B7CB3] hover:bg-[#1E5A87] text-white px-4 py-2 rounded-none"
            >
              Spróbuj ponownie
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm">Witaj w panelu administracyjnym, {session?.user?.username}!</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B7CB3]"></div>
          <p className="ml-3 text-sm text-gray-600">Ładowanie danych...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Wszystkie artykuły</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium text-gray-900">{stats?.articleStats.total_articles || 0}</div>
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Opublikowane</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium text-gray-900">{stats?.articleStats.published_articles || 0}</div>
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Szkice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium text-gray-900">{stats?.articleStats.draft_articles || 0}</div>
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Łączne wyświetlenia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium text-gray-900">{stats?.articleStats.total_views || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Ostatnie artykuły</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentArticles && stats.recentArticles.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentArticles.map((article, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-none">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900">{article.title}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(article.created_at).toLocaleDateString("pl-PL")} • {article.author_name}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-sm rounded-none ${
                          article.status === "published" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {article.status === "published" ? "Opublikowany" : "Szkic"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Brak artykułów</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Szybkie akcje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a
                    href="/admin/articles/new"
                    className="block w-full p-3 bg-[#2B7CB3] text-white text-center rounded-none hover:bg-[#1E5A87] transition-colors text-sm font-medium"
                  >
                    Dodaj nowy artykuł
                  </a>
                  <a
                    href="/admin/menu"
                    className="block w-full p-3 bg-gray-100 text-gray-700 text-center rounded-none hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Zarządzaj menu
                  </a>
                  <a
                    href="/admin/settings"
                    className="block w-full p-3 bg-gray-100 text-gray-700 text-center rounded-none hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Ustawienia strony
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
