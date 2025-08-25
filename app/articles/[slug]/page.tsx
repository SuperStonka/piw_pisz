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
import { notFound } from "next/navigation"

interface Article {
  id: number
  title: string
  content: string
  excerpt: string
  slug: string
  created_at: string
  updated_at: string
  view_count: number
  author_name: string
  responsible_person: string
  updated_by_name?: string
  menu_item_id?: number
}

interface Version {
  id: number
  version_number: number
  title: string
  content: string
  excerpt: string
  updated_by: number
  updated_by_name: string
  created_at: string
  change_summary: string
}

interface PageProps {
  params: {
    slug: string
  }
}

export default function ArticlePage({ params }: PageProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreviousVersions, setShowPreviousVersions] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [contrastMode, setContrastMode] = useState(false)
  const [textMode, setTextMode] = useState(false)
  const [fontSize, setFontSize] = useState("normal")
  const [settings, setSettings] = useState<any>({})
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [selectedMenuItem, setSelectedMenuItem] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch article
        const articleResponse = await fetch(`/api/public/articles/${params.slug}`)
        if (!articleResponse.ok) {
          if (articleResponse.status === 404) {
            notFound()
          }
          throw new Error('Failed to fetch article')
        }
        const articleData = await articleResponse.json()
        setArticle(articleData.article)
        setVersions(articleData.versions || [])
        


        // Fetch settings
        const settingsResponse = await fetch("/api/public/settings")
        const settingsData = await settingsResponse.json()
        setSettings(settingsData.settings || {})

        // Fetch menu items
        const menuResponse = await fetch("/api/public/menu")
        const menuData = await menuResponse.json()
        setMenuItems(menuData.menuItems || [])

        // Set selected menu item based on article's menu_item_id
        if (articleData.article?.menu_item_id) {
          setSelectedMenuItem(articleData.article.menu_item_id)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Nie udało się załadować artykułu")
        setLoading(false)
      }
    }

    fetchData()
  }, [params.slug])

  const toggleContrast = () => setContrastMode(!contrastMode)
  const toggleTextMode = () => setTextMode(!textMode)
  const adjustFontSize = (size: string) => setFontSize(size)

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

  const handleMenuItemClick = (menuItem: any) => {
    // Navigate to home page with the specific menu item selected
    window.location.href = `/?menu=${menuItem.id}`
  }

  const handleBackToList = () => {
    // Try to go back to the article list (Aktualności)
    const aktualnosciItem = menuItems.find(item => item.title === "Aktualności")
    if (aktualnosciItem) {
      window.location.href = `/?menu=${aktualnosciItem.id}`
    } else {
      window.history.back()
    }
  }

  const handlePrint = () => {
    alert('handlePrint called!')
    console.log('handlePrint called')
    window.print()
  }

  // Alternatywna funkcja do testowania
  const testPrint = () => {
    alert('Test print function called!')
    console.log('Test print function called!')
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2B7CB3]"></div>
          <p className="mt-4 text-gray-600">Ładowanie artykułu...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Błąd</h1>
          <p className="text-gray-600 mb-4">{error || "Artykuł nie został znaleziony"}</p>
          <Button 
            onClick={handleBackToList}
            className="bg-[#2B7CB3] hover:bg-[#1E5A87]"
          >
            Powrót
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{article?.title ? `${article.title} - BIP - Powiatowy Inspektorat Weterynaryjny w Piszu` : 'BIP - Powiatowy Inspektorat Weterynaryjny w Piszu'}</title>
        <meta name="description" content={article?.excerpt || "Biuletyn Informacji Publicznej - Powiatowy Inspektorat Weterynaryjny w Piszu"} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        className={`min-h-screen px-[50px] ${contrastMode ? "bg-black text-white" : "bg-white text-gray-900"} ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"}`}
      >
      {/* Accessibility Bar */}
      <div className={`accessibility-bar ${contrastMode ? "bg-gray-800" : "bg-gray-100"} border-b px-4 py-2`}>
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
            {article?.menu_item_id && menuItems.length > 0 && (() => {
              const menuPath = getMenuItemPath(menuItems, article.menu_item_id)
              return menuPath.map((item, index) => (
                <React.Fragment key={item.id}>
                  <li>
                    <span className="text-gray-500">/</span>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleMenuItemClick(item)}
                      className="text-[#2B7CB3] hover:underline"
                    >
                      {item.title}
                    </button>
                  </li>
                </React.Fragment>
              ))
            })()}
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li>
              <span className="text-gray-500 truncate max-w-xs" title={article?.title}>
                {article?.title}
              </span>
            </li>
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
            {/* Page Title Bar */}
            <div className={`${contrastMode ? "bg-yellow-600 text-black" : "bg-[#2B7CB3] text-white"} px-6 py-3 -mx-6 mb-6`}>
              <h1 className="text-lg font-semibold">
                {article?.menu_item_id ? findMenuItemInHierarchy(menuItems, article.menu_item_id)?.title || 'Aktualności' : 'Aktualności'}
              </h1>
            </div>
            
          <article className={`shadow-sm border p-6 rounded-none ${contrastMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}>
            <header className="mb-6">
              <h1 className={`text-3xl font-normal mb-4 ${contrastMode ? "text-yellow-400" : "text-[#1E5A87]"}`}>
                {article.title}
              </h1>
              <div className={`text-sm ${contrastMode ? "text-gray-300" : "text-gray-600"}`}>
                <p>Opublikowano: {new Date(article.created_at).toLocaleDateString("pl-PL")}</p>
                <p>Wyświetleń: {article.view_count}</p>
              </div>
            </header>

            <div className="prose prose-lg max-w-none mb-8">
              <div
                className={`leading-relaxed space-y-4 ${contrastMode ? "text-white" : "text-gray-700"}`}
                style={{
                  fontSize: '15px',
                  lineHeight: '1.7'
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Previous Versions Section */}
            {showPreviousVersions && (
              <Card className={`mb-6 rounded-none ${contrastMode ? "bg-gray-700 border-gray-600" : ""}`}>
                <CardHeader className="bg-[#2B7CB3] text-white rounded-none">
                  <CardTitle>poprzednie wersje: {article.title}</CardTitle>
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
                        {versions.map((version, index) => (
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
                        <span className={contrastMode ? "text-white" : ""}>{article.responsible_person}</span>
                      </div>
                      <div
                        className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                      >
                        <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>Data wytworzenia:</span>
                        <span className={contrastMode ? "text-white" : ""}>
                          {new Date(article.created_at).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                      >
                        <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>
                          Data opublikowania:
                        </span>
                        <span className={contrastMode ? "text-white" : ""}>
                          {new Date(article.created_at).toLocaleDateString("pl-PL")}{" "}
                          {new Date(article.created_at).toLocaleTimeString("pl-PL", {
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
                          {article.updated_by_name || article.author_name}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between py-1 border-b ${contrastMode ? "border-gray-600" : ""}`}
                      >
                        <span className={`font-normal ${contrastMode ? "text-white" : ""}`}>
                          Data ostatniej aktualizacji:
                        </span>
                        <span className={contrastMode ? "text-white" : ""}>
                          {new Date(article.updated_at).toLocaleDateString("pl-PL")}{" "}
                          {new Date(article.updated_at).toLocaleTimeString("pl-PL", {
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
                        <span className="text-blue-600">{article.view_count}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Print Button at Bottom */}
            <div className="flex justify-center my-6 no-print">
              <Button
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-50 text-[#2B7CB3] border-[#2B7CB3] rounded-none flex items-center gap-3 px-8 py-3"
                onClick={() => {
                  alert('Button clicked!')
                  console.log('Button clicked!')
                  window.print()
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8M16,19H8V15H16V19M19,12A1,1 0 0,1 18,13A1,1 0 0,1 17,12A1,1 0 0,1 18,11A1,1 0 0,1 19,12M16,2V6H8V2H16Z" />
                </svg>
                Drukuj artykuł
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white border-red-500 rounded-none flex items-center gap-3 px-8 py-3 ml-4"
                onClick={testPrint}
              >
                🧪 Test Print
              </Button>
            </div>

            {/* Action Buttons */}
            <div
              className={`action-buttons text-white p-3 flex flex-wrap items-center justify-between gap-2 ${contrastMode ? "bg-gray-900" : "bg-[#2B7CB3]"}`}
            >
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#1E5A87] hover:bg-[#164A73] text-white rounded-none flex items-center gap-2"
                  onClick={handlePrint}
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
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-[#1E5A87] hover:bg-[#164A73] text-white rounded-none flex items-center gap-2"
                  onClick={handleBackToList}
                >
                  ← Powrót
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
              <p>{settings.contact_address || "Al. J. Piłsudskiego 15A/1"}</p>
              <p>{settings.contact_city || "12-200 Pisz"}</p>
              <p>Tel: {settings.contact_phone || "87 423 27 53"}</p>
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
