"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

interface MenuItem {
  id: number
  title: string
  slug: string
  parent_id: number | null
  display_mode: string
  show_excerpts: boolean
  hidden: boolean
}

export default function NewArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState("")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: "draft",
    menu_category: "",
    responsible_person: "",
  })

  // Funkcja do pobierania pozycji menu
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

  // Pobierz aktualnie zalogowanego użytkownika
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession")
    if (adminSession) {
      try {
        const userData = JSON.parse(adminSession)
        setCurrentUser(userData.username || "")
        
        // Pobierz pełne dane użytkownika z API
        fetchUserData(userData.username)
        // Pobierz pozycje menu
        fetchMenuItems()
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
          setFormData(prev => ({
            ...prev,
            responsible_person: fullName
          }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/articles")
      } else {
        alert("Błąd podczas zapisywania artykułu")
      }
    } catch (error) {
      console.error("Error creating article:", error)
      alert("Błąd podczas zapisywania artykułu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-normal text-gray-900">Nowy artykuł</h1>
        <p className="text-gray-600">Utwórz nowy artykuł dla strony</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-normal">Treść artykułu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Tytuł artykułu</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange(e)}
                    required
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (adres URL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="rounded-none flex-1"
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
                  <Label htmlFor="excerpt">Krótki opis (opcjonalnie)</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Treść artykułu</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Wprowadź treść artykułu..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-normal">Ustawienia publikacji</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white"
                  >
                    <option value="draft">Szkic</option>
                    <option value="published">Opublikowany</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="menu_category">Kategoria menu</Label>
                  <select
                    id="menu_category"
                    name="menu_category"
                    value={formData.menu_category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white"
                  >
                    <option value="">Wybierz kategorię</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.title}>
                        {item.title}
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

            <div className="mt-6 flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1 bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none">
                {loading ? "Zapisywanie..." : "Zapisz artykuł"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/articles")}
                className="rounded-none"
              >
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
