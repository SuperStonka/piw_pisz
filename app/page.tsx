"use client"

import React, { useState, useEffect } from "react"
import Head from "next/head"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Menu Item Component for hierarchical rendering (always expanded)
const MenuItemComponent = ({ item, selectedMenuItem, contrastMode, onMenuClick, level }: {
  item: any
  selectedMenuItem: number | null
  contrastMode: boolean
  onMenuClick: (item: any) => void
  level: number
}) => {
  const hasChildren = item.children && item.children.length > 0
  const isSelected = selectedMenuItem === item.id
  const paddingLeft = level * 20 + 16 // 16px base + 20px per level

  return (
    <li className={`border-b ${contrastMode ? "border-gray-600" : "border-gray-200"}`}>
      <a
        href="#"
        className={`block py-3 ${
          isSelected
            ? "bg-[#2B7CB3] text-white font-normal border-b-2 border-white"
            : contrastMode
              ? "text-white hover:bg-gray-600"
              : "text-gray-700 hover:bg-gray-50"
        }`}
        style={{ paddingLeft: `${paddingLeft}px`, fontSize: '15px' }}
        onClick={(e) => {
          e.preventDefault()
          onMenuClick(item)
        }}
      >
        {item.title}
      </a>
      {hasChildren && (
        <ul className="space-y-0">
          {item.children.map((child: any) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              selectedMenuItem={selectedMenuItem}
              contrastMode={contrastMode}
              onMenuClick={onMenuClick}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function PiszPIWWebsite() {
  const [contrastMode, setContrastMode] = useState(false)
  const [textMode, setTextMode] = useState(false)
  const [fontSize, setFontSize] = useState("normal")
  const [showPreviousVersions, setShowPreviousVersions] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)

  const [menuItems, setMenuItems] = useState([])
  const [currentArticle, setCurrentArticle] = useState(null)
  const [currentArticles, setCurrentArticles] = useState([])
  const [articleVersions, setArticleVersions] = useState([])
  const [selectedMenuDisplayMode, setSelectedMenuDisplayMode] = useState('single')

  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  })

  const fetchData = async (selectedMenuId?: number | null) => {
      try {
        // Fetch menu items
        const menuResponse = await fetch("/api/public/menu")
        const menuData = await menuResponse.json()
        setMenuItems(menuData.menuItems || [])

        // Fetch settings
        const settingsResponse = await fetch("/api/public/settings")
        const settingsData = await settingsResponse.json()
        setSettings(settingsData.settings || {})

        // Set the menu item as selected and fetch its articles
        if (menuData.menuItems && menuData.menuItems.length > 0) {
          const targetMenuItem = selectedMenuId 
            ? menuData.menuItems.find((item: any) => item.id === selectedMenuId) || menuData.menuItems[0]
            : menuData.menuItems[0]
          setSelectedMenuItem(targetMenuItem.id)
          setSelectedMenuDisplayMode(targetMenuItem.display_mode || 'single')
          
          // Use the new function to fetch articles
          await fetchArticlesForMenuItem(targetMenuItem, 1)
          
          // For single articles, also fetch versions
          if (targetMenuItem.display_mode !== 'list') {
            try {
              const articlesResponse = await fetch(`/api/public/articles?menuItemId=${targetMenuItem.id}&limit=1`)
        const articlesData = await articlesResponse.json()
        if (articlesData.articles && articlesData.articles.length > 0) {
          const article = articlesData.articles[0]
          const articleResponse = await fetch(`/api/public/articles/${article.slug}`)
          const articleData = await articleResponse.json()
          setArticleVersions(articleData.versions || [])
              }
            } catch (error) {
              console.error("Error fetching article versions:", error)
            }
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const menuId = urlParams.get('menu')
    fetchData(menuId ? parseInt(menuId) : null)
  }, [])

  const toggleContrast = () => setContrastMode(!contrastMode)
  const toggleTextMode = () => setTextMode(!textMode)
  const adjustFontSize = (size: string) => setFontSize(size)

  const fetchArticlesForMenuItem = async (menuItem: any, page: number = 1) => {
    try {
      const limit = menuItem.display_mode === 'list' ? 20 : 1  // 20 articles per page for list mode
      const response = await fetch(`/api/public/articles?menuItemId=${menuItem.id}&limit=${limit}&page=${page}`)
      const data = await response.json()
      
      if (data.articles) {
        if (menuItem.display_mode === 'list') {
          // List mode: show multiple articles
          setCurrentArticles(data.articles)
          setCurrentArticle(null)
          setArticleVersions([])
          setPagination(data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalArticles: data.articles.length,
            hasNextPage: false,
            hasPrevPage: false,
            limit
          })
        } else {
          // Single mode: show one article
          setCurrentArticle(data.articles[0] || null)
          setCurrentArticles([])
          setArticleVersions([])
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalArticles: 1,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 1
          })
        }
      }
    } catch (error) {
      console.error("Error fetching articles:", error)
    }
  }

  const handleMenuItemClick = async (menuItem: any) => {
    setSelectedMenuItem(menuItem.id)
    setSelectedMenuDisplayMode(menuItem.display_mode || 'single')
    await fetchArticlesForMenuItem(menuItem, 1) // Reset to page 1 when switching menu items

    // For single articles, also fetch versions
    if (menuItem.display_mode !== 'list') {
      try {
        const response = await fetch(`/api/public/articles?menuItemId=${menuItem.id}&limit=1`)
      const data = await response.json()
      if (data.articles && data.articles.length > 0) {
        const article = data.articles[0]
        const articleResponse = await fetch(`/api/public/articles/${article.slug}`)
        const articleData = await articleResponse.json()
        setArticleVersions(articleData.versions || [])
      }
    } catch (error) {
        console.error("Error fetching article versions:", error)
      }
    }
  }

  const handlePageChange = async (page: number) => {
    const findMenuItem = (items: any[], id: number): any => {
      for (const item of items) {
        if (item.id === id) return item
        if (item.children) {
          const found = findMenuItem(item.children, id)
          if (found) return found
        }
      }
      return null
    }
    
    const currentMenuItem = findMenuItem(menuItems, selectedMenuItem)
    if (currentMenuItem) {
      await fetchArticlesForMenuItem(currentMenuItem, page)
    }
  }



  const findMenuItemInHierarchy = (items: any[], id: number): any => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findMenuItemInHierarchy(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  const getMenuItemPath = (items: any[], targetId: number, path: any[] = []): any[] => {
    for (const item of items) {
      const currentPath = [...path, item]
      
      if (item.id === targetId) {
        return currentPath
      }
      
      if (item.children) {
        const foundPath = getMenuItemPath(item.children, targetId, currentPath)
        if (foundPath.length > 0) {
          return foundPath
        }
      }
    }
    return []
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2B7CB3]"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>BIP - Powiatowy Inspektorat Weterynaryjny w Piszu</title>
        <meta name="description" content="Biuletyn Informacji Publicznej - Powiatowy Inspektorat Weterynaryjny w Piszu" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
    <div
      className={`min-h-screen px-[50px] ${contrastMode ? "bg-black text-white" : "bg-white text-gray-900"} ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"}`}
    >
      {/* Accessibility Bar */}
      <div className={`${contrastMode ? "bg-gray-800" : "bg-gray-100"} border-b px-4 py-2`}>
        <div className="w-full flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => adjustFontSize("small")} className="hover:underline">
              A-
            </button>
            <button onClick={() => adjustFontSize("normal")} className="hover:underline">
              A
            </button>
            <button onClick={() => adjustFontSize("large")} className="hover:underline">
              A+
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleContrast} className="hover:underline">
              Wersja kontrastowa
            </button>
            <button onClick={toggleTextMode} className="hover:underline">
              Wersja tekstowa
            </button>
            <a href="/articles/oswiadczenie-o-dostepnosci" className="hover:underline">
              Deklaracja dostępności
            </a>
            <a href="/articles/slownik-skrotow" className="hover:underline">
              Słownik skrótów
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`${contrastMode ? "bg-white text-black" : "bg-[#2B7CB3] text-white"}`}>
        <div className="w-full px-4 py-6">
          <div className="flex items-center gap-4">
            {!textMode && <img src="/polish-coat-of-arms.png" alt="Herb Polski" className="h-20 w-20" />}
            <div>
              <h1 className="text-2xl font-normal">
                {settings.site_title || "Powiatowy Inspektorat Weterynaryjny w Piszu"}
              </h1>
              <p className={`${contrastMode ? "text-gray-600" : "text-blue-100"}`}>
                {settings.site_subtitle || "Biuletyn Informacji Publicznej"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${contrastMode ? "bg-black text-white" : "bg-[#1E5A87] text-white"}`}>
        <div className="w-full px-4">
           <p>&nbsp;</p>
          </div>
        </nav>

        {/* Breadcrumb */}
        <div className="w-full px-4 py-2 bg-gray-50 border-b">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/" className="text-[#2B7CB3] hover:underline">Strona główna</a>
            </li>
              {selectedMenuItem && menuItems.length > 0 && (() => {
                const menuPath = getMenuItemPath(menuItems, selectedMenuItem)
                return menuPath.map((item, index) => (
                  <React.Fragment key={item.id}>
            <li>
                      <span className="text-gray-500">/</span>
            </li>
            <li>
                      {index === menuPath.length - 1 ? (
                        <span className="text-gray-900">{item.title}</span>
                      ) : (
                        <button 
                          onClick={() => handleMenuItemClick(item)}
                          className="text-[#2B7CB3] hover:underline"
                        >
                          {item.title}
                        </button>
                      )}
            </li>
                  </React.Fragment>
                ))
              })()}
            </ol>
          </nav>
        </div>

      {/* Main Content */}
      <main className="w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className={`rounded-none ${contrastMode ? "bg-gray-700 border-gray-600" : ""}`}>
              <CardContent className="p-0">
                <ul className="space-y-0">
                  {menuItems.filter(item => !item.hidden).map((item) => (
                    <MenuItemComponent
                      key={item.id}
                      item={item}
                      selectedMenuItem={selectedMenuItem}
                      contrastMode={contrastMode}
                      onMenuClick={handleMenuItemClick}
                      level={0}
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="mt-4 space-y-3">
              {/* Civil Service Button */}
              <Card
                className={`rounded-none border-2 ${contrastMode ? "border-gray-600 bg-gray-700" : "border-gray-300"}`}
              >
                <CardContent className="p-3">
                  <a
                    href="https://www.gov.pl/web/sluzbacywilna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 transition-colors ${contrastMode ? "hover:bg-gray-600" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex-shrink-0">
                      <img 
                        src="/sc-ico.png" 
                        alt="Służba Cywilna" 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <span className={`font-normal ${contrastMode ? "text-white" : "text-gray-800"}`}>
                      Służba Cywilna
                    </span>
                  </a>
                </CardContent>
              </Card>

              {/* BIP.gov.pl Button */}
              <Card
                className={`rounded-none border-2 ${contrastMode ? "border-gray-600 bg-gray-700" : "border-gray-300"}`}
              >
                <CardContent className="p-3">
                  <a
                    href="https://www.gov.pl/web/bip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 transition-colors ${contrastMode ? "hover:bg-gray-600" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex-shrink-0">
                      <img 
                        src="/bip-gov.png" 
                        alt="BIP - Biuletyn Informacji Publicznej" 
                        className="w-auto object-contain"
                        style={{ height: '60px' }}
                      />
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Article Content */}
          <div className="lg:col-span-4">
            {/* Page Title Bar - Always Show */}
            <div className={`${contrastMode ? "bg-yellow-600 text-black" : "bg-[#2B7CB3] text-white"} px-6 py-3 -mx-6 mb-6`}>
              <h1 className="text-lg font-semibold">
                {findMenuItemInHierarchy(menuItems, selectedMenuItem)?.title || 'Artykuły'}
              </h1>
            </div>

            {selectedMenuDisplayMode === 'list' ? (
              // List mode: Show multiple articles
              <div className="space-y-4">
                {currentArticles.length > 0 ? (
                  currentArticles.map((article, index) => (
                    <article
                      key={article.id}
                      className={`shadow-sm border p-4 rounded-none ${contrastMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}
                    >
                      <header className="mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className={`text-xl font-normal flex-1 ${contrastMode ? "text-yellow-400" : "text-[#1E5A87]"}`}>
                            <a href={`/articles/${article.slug}`} className="hover:underline">
                              {article.title}
                            </a>
                          </h2>
                          <p 
                            className={`ml-4 flex-shrink-0 ${contrastMode ? "text-gray-300" : "text-gray-600"}`}
                            style={{ fontSize: '13px' }}
                          >
                            {new Date(article.created_at).toLocaleDateString("pl-PL")}
                          </p>
                        </div>
                      </header>
                      
                      {article.excerpt && (
                        <div className="prose prose-sm max-w-none mb-3">
                          <p 
                            className={`leading-relaxed ${contrastMode ? "text-white" : "text-gray-700"}`}
                            style={{ fontSize: '13px' }}
                          >
                            {article.excerpt}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <a 
                          href={`/articles/${article.slug}`}
                          className={`text-sm font-medium ${contrastMode ? "text-yellow-400 hover:text-yellow-300" : "text-[#2B7CB3] hover:text-[#1E5A87]"}`}
                        >
                          Czytaj więcej →
                        </a>
                        <span className={`text-xs ${contrastMode ? "text-gray-400" : "text-gray-500"}`}>
                          Wyświetleń: {article.view_count || 0}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div
                    className={`shadow-sm border p-6 rounded-none text-center ${contrastMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}
                  >
                    <p className={contrastMode ? "text-white" : "text-gray-600"}>Brak artykułów w tej kategorii.</p>
                  </div>
                )}
                
                {/* Pagination Controls */}
                {currentArticles.length > 0 && pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <nav aria-label="Stronicowanie artykułów" className="flex items-center justify-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {/* First page */}
                        {pagination.currentPage > 2 && (
                          <>
                            <button
                              onClick={() => handlePageChange(1)}
                              className={`px-3 py-2 text-sm font-medium rounded ${
                                contrastMode 
                                ? "bg-gray-700 text-white hover:bg-gray-600" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              aria-label="Pierwsza strona"
                            >
                              1
                            </button>
                            {pagination.currentPage > 3 && (
                              <span className={`px-2 ${contrastMode ? "text-gray-400" : "text-gray-500"}`}>...</span>
                            )}
                          </>
                        )}

                        {/* Previous page */}
                        {pagination.hasPrevPage && (
                          <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            className={`px-3 py-2 text-sm font-medium rounded ${
                              contrastMode 
                              ? "bg-gray-700 text-white hover:bg-gray-600" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            aria-label="Poprzednia strona"
                          >
                            ← Poprzednia
                          </button>
                        )}

                        {/* Page numbers around current page */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1
                          } else if (pagination.currentPage <= 3) {
                            pageNum = i + 1
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i
                          } else {
                            pageNum = pagination.currentPage - 2 + i
                          }

                          if (pageNum < 1 || pageNum > pagination.totalPages) return null

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded ${
                                pageNum === pagination.currentPage
                                  ? contrastMode
                                    ? "bg-yellow-600 text-black font-bold"
                                    : "bg-[#1E5A87] text-white font-bold"
                                  : contrastMode
                                  ? "bg-gray-700 text-white hover:bg-gray-600"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              aria-label={pageNum === pagination.currentPage ? `Strona ${pageNum} (aktualnie wyświetlana)` : `Strona ${pageNum}`}
                              aria-current={pageNum === pagination.currentPage ? "page" : undefined}
                            >
                              {pageNum}
                            </button>
                          )
                        })}

                        {/* Next page */}
                        {pagination.hasNextPage && (
                          <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            className={`px-3 py-2 text-sm font-medium rounded ${
                              contrastMode 
                              ? "bg-gray-700 text-white hover:bg-gray-600" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            aria-label="Następna strona"
                          >
                            Następna →
                          </button>
                        )}

                        {/* Last page */}
                        {pagination.currentPage < pagination.totalPages - 1 && (
                          <>
                            {pagination.currentPage < pagination.totalPages - 2 && (
                              <span className={`px-2 ${contrastMode ? "text-gray-400" : "text-gray-500"}`}>...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(pagination.totalPages)}
                              className={`px-3 py-2 text-sm font-medium rounded ${
                                contrastMode 
                                ? "bg-gray-700 text-white hover:bg-gray-600" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              aria-label="Ostatnia strona"
                            >
                              {pagination.totalPages}
                            </button>
                          </>
                        )}
                      </div>
                    </nav>

                    {/* Pagination info */}
                    <div className={`text-center mt-3 text-sm ${contrastMode ? "text-gray-300" : "text-gray-600"}`}>
                      Strona {pagination.currentPage} z {pagination.totalPages} 
                      {pagination.totalArticles > 0 && (
                        <span> • Liczba artykułów na stronie: {Math.min(pagination.limit, pagination.totalArticles - ((pagination.currentPage - 1) * pagination.limit))} z {pagination.totalArticles}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : currentArticle ? (
              // Single mode: Show one article
              <article
                className={`shadow-sm border p-6 rounded-none ${contrastMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}
              >
                <header className="mb-6">
                  <h1 className={`text-2xl font-normal mb-2 ${contrastMode ? "text-yellow-400" : "text-[#1E5A87]"}`}>
                    {currentArticle.title}
                  </h1>
                </header>

                <div className="prose prose-lg max-w-none mb-8">
                  <div
                    className={`leading-relaxed space-y-4 ${contrastMode ? "text-white" : "text-gray-700"}`}
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.7'
                    }}
                    dangerouslySetInnerHTML={{ __html: currentArticle.content }}
                  />
                </div>

                {/* Previous Versions Section */}
                {showPreviousVersions && (
                  <Card className={`mb-6 rounded-none ${contrastMode ? "bg-gray-700 border-gray-600" : ""}`}>
                    <CardHeader className="bg-[#2B7CB3] text-white rounded-none">
                      <CardTitle>poprzednie wersje: {currentArticle.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div
                        className={`p-3 text-sm text-center ${contrastMode ? "bg-gray-600 text-white" : "bg-yellow-50"}`}
                      >
                        * każdorazowo możesz wybrać do porównania tylko 2 wersje artykułu
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={contrastMode ? "bg-gray-600" : "bg-gray-50"}>
                            <tr>
                              <th className={`px-4 py-2 text-left ${contrastMode ? "text-white" : ""}`}>
                                Data aktualizacji
                              </th>
                              <th className={`px-4 py-2 text-left ${contrastMode ? "text-white" : ""}`}>
                                Zaktualizował
                              </th>
                              <th className={`px-4 py-2 text-left ${contrastMode ? "text-white" : ""}`}>
                                Podgląd treści
                              </th>
                              <th className={`px-4 py-2 text-left ${contrastMode ? "text-white" : ""}`}>Porównaj</th>
                            </tr>
                          </thead>
                          <tbody>
                            {articleVersions.map((version, index) => (
                              <tr key={version.id} className={`border-b ${contrastMode ? "border-gray-600" : ""}`}>
                                <td className={`px-4 py-2 ${contrastMode ? "text-white" : ""}`}>
                                  {new Date(version.created_at).toLocaleDateString("pl-PL")}{" "}
                                  {new Date(version.created_at).toLocaleTimeString("pl-PL", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className={`px-4 py-2 ${contrastMode ? "text-white" : ""}`}>
                                  {version.updated_by_name}
                                </td>
                                <td className="px-4 py-2">
                                  <button className="text-[#2B7CB3] hover:text-[#1E5A87]">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="inline-block"
                                    >
                                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5S13.09 3 9.5 3S14 5.91 14 9.5 11.99 14 9.5 14c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                    </svg>
                                  </button>
                                </td>
                                <td className="px-4 py-2">
                                  <input type="checkbox" className="rounded" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Metadata Section */}
                {showMetadata && (
                  <Card className={`mb-6 rounded-none ${contrastMode ? "bg-gray-700 border-gray-600" : ""}`}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div
                            className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                          >
                            <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>
                              Odpowiedzialny za treść:
                            </span>
                            <span className={contrastMode ? "text-white" : ""}>{currentArticle.author_name}</span>
                          </div>
                          <div
                            className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                          >
                            <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>Data wytworzenia:</span>
                            <span className={contrastMode ? "text-white" : ""}>
                              {new Date(currentArticle.created_at).toLocaleDateString("pl-PL")}
                            </span>
                          </div>
                          <div
                            className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                          >
                            <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>
                              Data opublikowania:
                            </span>
                            <span className={contrastMode ? "text-white" : ""}>
                              {new Date(currentArticle.created_at).toLocaleDateString("pl-PL")}{" "}
                              {new Date(currentArticle.created_at).toLocaleTimeString("pl-PL", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                          >
                            <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>
                              Ostatnio zaktualizował:
                            </span>
                            <span className={contrastMode ? "text-white" : ""}>
                              {currentArticle.updated_by_name || currentArticle.author_name}
                            </span>
                          </div>
                          <div
                            className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                          >
                            <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>
                              Data ostatniej aktualizacji:
                            </span>
                            <span className={contrastMode ? "text-white" : ""}>
                              {new Date(currentArticle.updated_at).toLocaleDateString("pl-PL")}{" "}
                              {new Date(currentArticle.updated_at).toLocaleTimeString("pl-PL", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div
                            className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                          >
                            <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>
                              Liczba wyświetleń:
                            </span>
                            <span className="text-blue-600">{currentArticle.view_count}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div
                  className={`text-white p-3 flex flex-wrap items-center justify-between gap-2 ${contrastMode ? "bg-gray-900" : "bg-[#2B7CB3]"}`}
                >
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-[#1E5A87] hover:bg-[#164A73] text-white rounded-none flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      Drukuj
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-[#1E5A87] hover:bg-[#164A73] text-white rounded-none flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      Zapisz do PDF
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-[#1E5A87] hover:bg-[#164A73] text-white rounded-none flex items-center gap-2"
                      onClick={() => setShowPreviousVersions(!showPreviousVersions)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
                      </svg>
                      poprzednie wersje
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-[#4A90B8] hover:bg-[#3A7FA8] text-white rounded-none flex items-center gap-2"
                      onClick={() => setShowMetadata(!showMetadata)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                      </svg>
                      metryczka
                    </Button>
                  </div>
                </div>
              </article>
            ) : (
              <div
                className={`shadow-sm border p-6 rounded-none text-center ${contrastMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}
              >
                <p className={contrastMode ? "text-white" : "text-gray-600"}>Brak artykułów do wyświetlenia.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`${contrastMode ? "bg-gray-900 text-white" : "bg-[#1E5A87] text-white"} mt-12`}>
        <div className="w-full px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4">Kontakt</h3>
              <p>{settings.contact_name || "Powiatowy Inspektorat Weterynaryjny w Piszu"}</p>
              <p>{settings.contact_address || "ul. Przykładowa 1"}</p>
              <p>{settings.contact_city || "19-400 Pisz"}</p>
              <p>Tel: {settings.contact_phone || "+48 87 520 XX XX"}</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Godziny pracy</h3>
              <p>poniedziałek, wtorek, czwartek i piątek: 7:00 – 15:00</p>
              <p>środę: 8:00 – 16:00</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Przydatne linki</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    Ministerstwo Rolnictwa
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Główny Inspektorat Weterynarii
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    BIP
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
