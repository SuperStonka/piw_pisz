"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsData {
  articleStats: {
    total_articles: number
    published_articles: number
    draft_articles: number
    total_views: number
    avg_views: number
  }
  mostViewed: Array<{
    title: string
    slug: string
    view_count: number
    updated_at: string
  }>
  recentArticles: Array<{
    title: string
    slug: string
    status: string
    created_at: string
    author_name: string
  }>
  categoryStats: Array<{
    menu_category: string
    count: number
    total_views: number
  }>
  monthlyStats: Array<{
    month: string
    articles_created: number
    articles_published: number
  }>
  userStats: Array<{
    username: string
    articles_created: number
    total_views: number
    last_activity: string
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B7CB3]"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Błąd podczas ładowania danych analitycznych</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Analityka</h1>
        <p className="text-gray-600 text-sm">Statystyki i analiza aktywności na stronie</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Wszystkie artykuły</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium text-gray-900">{data.articleStats.total_articles}</div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Opublikowane</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium text-gray-900">{data.articleStats.published_articles}</div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Szkice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium text-gray-900">{data.articleStats.draft_articles}</div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Łączne wyświetlenia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium text-gray-900">{data.articleStats.total_views}</div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Średnie wyświetlenia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium text-gray-900">{Math.round(data.articleStats.avg_views)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Articles */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="font-normal">Najczęściej wyświetlane artykuły</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Tytuł</th>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Wyświetlenia</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mostViewed.map((article, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="font-normal text-sm">{article.title}</div>
                        <div className="text-xs text-gray-500">/{article.slug}</div>
                      </td>
                      <td className="px-4 py-2 text-sm">{article.view_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="font-normal">Ostatnie artykuły</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Tytuł</th>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Autor</th>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentArticles.map((article, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="font-normal text-sm">{article.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(article.created_at).toLocaleDateString("pl-PL")}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm">{article.author_name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-none ${
                            article.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {article.status === "published" ? "Opublikowany" : "Szkic"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Category Statistics */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="font-normal">Artykuły wg kategorii</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Kategoria</th>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Artykuły</th>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Wyświetlenia</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categoryStats.length > 0 ? (
                    data.categoryStats.map((category, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">
                          {category.menu_category === 'Bez kategorii' ? (
                            <span className="text-gray-500 italic">{category.menu_category}</span>
                          ) : (
                            category.menu_category
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">{category.count}</td>
                        <td className="px-4 py-2 text-sm">{category.total_views || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-sm text-gray-500 text-center">
                        Brak danych o kategoriach
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="font-normal">Aktywność użytkowników</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Użytkownik</th>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Artykuły</th>
                    <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Wyświetlenia</th>
                  </tr>
                </thead>
                <tbody>
                  {data.userStats.map((user, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="font-normal text-sm">{user.username}</div>
                        {user.last_activity && (
                          <div className="text-xs text-gray-500">
                            Ostatnia aktywność: {new Date(user.last_activity).toLocaleDateString("pl-PL")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">{user.articles_created || 0}</td>
                      <td className="px-4 py-2 text-sm">{user.total_views || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Statistics */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="font-normal">Statystyki miesięczne (ostatnie 12 miesięcy)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Miesiąc</th>
                  <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Utworzone artykuły</th>
                  <th className="px-4 py-2 text-left text-xs font-normal text-gray-500">Opublikowane artykuły</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyStats.map((stat, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{stat.month}</td>
                    <td className="px-4 py-2 text-sm">{stat.articles_created}</td>
                    <td className="px-4 py-2 text-sm">{stat.articles_published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
