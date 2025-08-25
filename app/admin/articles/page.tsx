"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Article {
  id: number
  title: string
  slug: string
  status: string
  menu_category: string
  author_username: string
  author_imie: string | null
  author_nazwisko: string | null
  category_name: string
  created_at: string
  updated_at: string
  view_count: number
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/admin/articles")
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
        
        // Pobierz unikalne kategorie
        const uniqueCategories = data
          .map((article: Article) => article.category_name)
          .filter((cat: string | null | undefined) => cat !== null && cat !== undefined && cat !== '') as string[]
        setCategories([...new Set(uniqueCategories)])
      }
    } catch (error) {
      console.error("Error fetching articles:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || article.status === statusFilter
    const matchesCategory = categoryFilter === "all" || article.category_name === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Paginacja
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArticles = filteredArticles.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset do pierwszej strony
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 rounded-none">Opublikowany</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 rounded-none">Szkic</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 rounded-none">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B7CB3]"></div>
        <p className="ml-3 text-sm text-gray-600">Ładowanie artykułów...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Artykuły</h1>
          <p className="text-gray-600 text-sm">Zarządzaj artykułami i treściami strony</p>
        </div>
        <Button className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-sm font-medium">
          <a href="/admin/articles/new">Dodaj nowy artykuł</a>
        </Button>
      </div>

      <Card className="rounded-none">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="font-medium text-lg">Lista artykułów</CardTitle>
            <div className="flex gap-4">
              <Input
                placeholder="Szukaj artykułów..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-none text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-none bg-white text-sm"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="published">Opublikowane</option>
                <option value="draft">Szkice</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-none bg-white text-sm"
              >
                <option value="all">Wszystkie kategorie</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Tytuł</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Autor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Kategoria</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Data utworzenia</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Wyświetlenia</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {currentArticles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{article.title}</div>
                        <div className="text-sm text-gray-500">{article.slug}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {article.author_imie && article.author_nazwisko 
                        ? `${article.author_imie} ${article.author_nazwisko}` 
                        : article.author_username}
                    </td>
                    <td className="px-4 py-3 text-sm">{article.category_name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(article.created_at).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3 text-sm">{article.view_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none text-sm font-medium"
                        >
                          <a href={`/admin/articles/${article.id}/edit`}>Edytuj</a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none text-sm font-medium"
                        >
                          <a href={`/articles/${article.slug}`} target="_blank">Podgląd</a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginacja i wybór liczby elementów */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Pokaż:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-none bg-white text-sm"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={300}>300</option>
              </select>
              <span className="text-sm text-gray-600">elementów na stronę</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Strona {currentPage} z {totalPages} ({filteredArticles.length} artykułów)
              </span>
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="rounded-none text-sm px-2 py-1"
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-none text-sm px-2 py-1"
                >
                  ‹
                </Button>
                
                {/* Numerowane strony */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`rounded-none text-sm px-2 py-1 ${
                        currentPage === pageNum ? "bg-[#2B7CB3] text-white" : ""
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-none text-sm px-2 py-1"
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="rounded-none text-sm px-2 py-1"
                >
                  »
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
