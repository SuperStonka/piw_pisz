"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

interface Article {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  status: string
  menu_item_id: number | null
  responsible_person: string
  author_name: string
  created_at: string
  updated_at: string
  view_count: number
}

interface MenuItem {
  id: number
  title: string
  slug: string
  parent_id: number | null
}

interface Version {
  id: number
  version_number: number
  title: string
  content: string
  excerpt: string
  updated_by_name: string
  change_summary: string
  created_at: string
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<number[]>([])
  const [currentUser, setCurrentUser] = useState<string>("")
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: "draft",
    menu_item_id: "",
    responsible_person: "",
    change_summary: "",
  })

  // Pobierz aktualnie zalogowanego użytkownika
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession")
    if (adminSession) {
      try {
        const userData = JSON.parse(adminSession)
        setCurrentUser(userData.username || "")
        
        // Pobierz pełne dane użytkownika z API
        fetchUserData(userData.username)
      } catch (error) {
        console.error("Error parsing session:", error)
      }
    }
  }, [])

  // Funkcja do pobierania pełnych danych użytkownika
  const fetchUserData = async (username: string) => {
    try {
      const response = await fetch(`/api/admin/users`)
      if (response.ok) {
        const users = await response.json()
        const currentUserData = users.find((user: any) => user.username === username)
        if (currentUserData) {
          const fullName = currentUserData.imie && currentUserData.nazwisko 
            ? `${currentUserData.imie} ${currentUserData.nazwisko}` 
            : currentUserData.username || ""
          // Zaktualizuj formData jeśli nie ma jeszcze responsible_person
          if (!formData.responsible_person) {
            setFormData(prev => ({
              ...prev,
              responsible_person: fullName
            }))
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // Funkcja generowania sluga z tytułu (identyczna jak w menu)
  const generateSlug = (title: string): string => {
    if (!title) return ""
    
    return title
      .toLowerCase()
      // Zamień polskie znaki na łacińskie
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      // Zamień spacje i znaki specjalne na myślniki
      .replace(/[^a-z0-9]/g, '-')
      // Usuń wielokrotne myślniki
      .replace(/-+/g, '-')
      // Usuń myślniki z początku i końca
      .replace(/^-|-$/g, '')
      // Skróć do maksymalnie 50 znaków
      .substring(0, 50)
      // Usuń myślnik z końca jeśli został po skróceniu
      .replace(/-$/, '')
  }

  useEffect(() => {
    if (params.id) {
      fetchArticle()
      fetchVersions()
      fetchMenuItems()
    }
  }, [params.id])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/admin/articles/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data)
        setFormData({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || "",
          status: data.status,
          menu_item_id: data.menu_item_id || "",
          responsible_person: data.responsible_person || currentUser,
          change_summary: "",
        })
      }
    } catch (error) {
      console.error("Error fetching article:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/admin/articles/${params.id}/versions`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
      }
    } catch (error) {
      console.error("Error fetching versions:", error)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/admin/menu")
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data)
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
    }
  }

  // Funkcja do formatowania nazwy menu z hierarchią
  const formatMenuItemTitle = (item: MenuItem, level: number = 0) => {
    const indent = "— ".repeat(level)
    return `${indent}${item.title}`
  }

  // Funkcja do budowania hierarchii menu
  const buildMenuHierarchy = (items: MenuItem[], parentId: number | null = null, level: number = 0): MenuItem[] => {
    const result: MenuItem[] = []
    
    for (const item of items) {
      if (item.parent_id === parentId) {
        result.push({ ...item, level })
        const children = buildMenuHierarchy(items, item.id, level + 1)
        result.push(...children)
      }
    }
    
    return result
  }

  // Pobierz menu z hierarchią
  const menuItemsWithHierarchy = buildMenuHierarchy(menuItems)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Specjalna obsługa dla tytułu - generuj slug
    if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleVersionSelect = (versionNumber: number) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionNumber)) {
        return prev.filter(v => v !== versionNumber)
      } else if (prev.length < 2) {
        return [...prev, versionNumber]
      }
      return prev
    })
  }

  const compareVersions = () => {
    // Implement version comparison logic
    alert("Porównywanie wersji - funkcja w trakcie implementacji")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const requestData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        status: formData.status,
        responsible_person: formData.responsible_person,
        menu_item_id: formData.menu_item_id ? Number(formData.menu_item_id) : null,
        change_summary: formData.change_summary,
      }
      
      console.log('Wysyłane dane:', requestData)
      
      const response = await fetch(`/api/admin/articles/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log('Status odpowiedzi:', response.status)
      console.log('Headers odpowiedzi:', response.headers)

      if (response.ok) {
        router.push("/admin/articles")
      } else {
        const error = await response.json()
        console.error('Błąd API:', error)
        alert(`Błąd podczas zapisywania: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving article:", error)
      alert("Wystąpił błąd podczas zapisywania")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B7CB3] mx-auto"></div>
        <p className="mt-2 text-gray-600">Ładowanie artykułu...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Artykuł nie został znaleziony</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Edytuj artykuł</h1>
          <p className="text-gray-600 text-base">
            ID: {article.id} | Utworzony: {new Date(article.created_at).toLocaleDateString("pl-PL")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowVersions(!showVersions)} className="rounded-none">
            {showVersions ? "Ukryj wersje" : "Pokaż wersje"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/articles")} className="rounded-none">
            Powrót
          </Button>
        </div>
      </div>

      {showVersions && (
        <Card className="rounded-none">
          <CardHeader className="bg-[#2B7CB3] text-white rounded-none">
            <CardTitle className="font-medium">Poprzednie wersje: {article.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-3 text-sm text-center bg-yellow-50">
              * każdorazowo możesz wybrać do porównania tylko 2 wersje artykułu
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-base font-medium">Data aktualizacji</th>
                    <th className="px-4 py-2 text-left text-base font-medium">Zaktualizował</th>
                    <th className="px-4 py-2 text-left text-base font-medium">Opis zmian</th>
                    <th className="px-4 py-2 text-left text-base font-medium">Podgląd treści</th>
                    <th className="px-4 py-2 text-left text-base font-medium">Porównaj</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((version) => (
                    <tr key={version.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-base">{new Date(version.created_at).toLocaleString("pl-PL")}</td>
                      <td className="px-4 py-2 text-base">{version.updated_by_name}</td>
                      <td className="px-4 py-2 text-base">{version.change_summary}</td>
                      <td className="px-4 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-none bg-transparent"
                          onClick={() => {
                            // Show version preview
                            alert(`Podgląd wersji ${version.version_number}`)
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5S13.09 3 9.5 3S14 5.91 14 9.5 11.99 14 9.5 14c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                          </svg>
                        </Button>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedVersions.includes(version.version_number)}
                          onChange={() => handleVersionSelect(version.version_number)}
                          disabled={!selectedVersions.includes(version.version_number) && selectedVersions.length >= 2}
                          className="rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedVersions.length === 2 && (
              <div className="p-4 border-t">
                <Button onClick={compareVersions} className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none">
                  Porównaj wybrane wersje
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-medium text-lg">Treść artykułu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base font-medium">Tytuł artykułu</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange(e)}
                    required
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="slug" className="text-base font-medium">Slug (adres URL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="rounded-none text-base flex-1"
                      maxLength={50}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                      className="rounded-none text-base font-medium whitespace-nowrap"
                      title="Regeneruj slug na podstawie tytułu"
                    >
                      Regeneruj
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Maksymalnie 50 znaków. Slug zostanie automatycznie wygenerowany z tytułu.
                  </p>
                </div>
                <div>
                  <Label htmlFor="excerpt" className="text-base font-medium">Krótki opis (opcjonalnie)</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="text-base font-medium">Treść artykułu</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Wprowadź treść artykułu..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="change_summary" className="text-base font-medium">Opis wprowadzonych zmian</Label>
                  <Input
                    id="change_summary"
                    name="change_summary"
                    value={formData.change_summary}
                    onChange={handleInputChange}
                    placeholder="Opisz co zostało zmienione w tej wersji"
                    className="rounded-none text-base"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-medium text-lg">Ustawienia publikacji</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status" className="text-base font-medium">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-base"
                  >
                    <option value="draft">Szkic</option>
                    <option value="published">Opublikowany</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="menu_item_id" className="text-base font-medium">Pozycja menu</Label>
                  <select
                    id="menu_item_id"
                    name="menu_item_id"
                    value={formData.menu_item_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-base"
                  >
                    <option value="">Wybierz pozycję menu</option>
                    {menuItemsWithHierarchy.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatMenuItemTitle(item)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="responsible_person" className="text-base font-medium">
                    Osoba odpowiedzialna za treść
                  </Label>
                  <Input
                    id="responsible_person"
                    value={formData.responsible_person}
                    onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                    required
                    disabled
                    className="rounded-none text-base bg-gray-100 cursor-not-allowed"
                  />
                  {currentUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Aktualnie zalogowany: <strong>{formData.responsible_person}</strong>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/articles")}
            className="rounded-none text-base font-medium"
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-base font-medium"
          >
            {saving ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </div>
      </form>
    </div>
  )
}
