"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface MenuItem {
  id: number
  title: string
  slug: string
  parent_id: number | null
  sort_order: number
  is_active: boolean
  display_mode: 'single' | 'list'
  show_excerpts: boolean
  hidden: boolean
  created_at: string
  updated_at: string
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null)
  const [articlesCount, setArticlesCount] = useState<{[key: number]: number}>({})
  const [newItem, setNewItem] = useState({ 
    title: "", 
    slug: "", 
    parent_id: null as number | null,
    display_mode: 'single' as 'single' | 'list',
    show_excerpts: false,
    hidden: false
  })
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null)
  const [dragOverItem, setDragOverItem] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    console.log('=== useEffect fetchMenuItems START ===')
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/admin/menu")
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data)
        // Pobierz liczbę artykułów dla każdej pozycji menu
        await fetchArticlesCount(data)
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
      showMessage('error', 'Błąd podczas ładowania menu')
    } finally {
      setLoading(false)
    }
  }

  // Funkcja pobierania liczby artykułów dla każdej pozycji menu
  const fetchArticlesCount = async (menuItems: MenuItem[]) => {
    try {
      console.log('=== fetchArticlesCount START ===')
      console.log('Otrzymane menuItems:', menuItems)
      
      const counts: {[key: number]: number} = {}
      
      // Pobierz wszystkie artykuły za jednym razem
      const response = await fetch('/api/admin/articles')
      if (response.ok) {
        const allArticles = await response.json()
        
        console.log('Wszystkie artykuły:', allArticles.length)
        console.log('Pozycje menu:', menuItems.length)
        
        // Policz artykuły dla każdej pozycji menu
        for (const item of menuItems) {
          const itemArticles = allArticles.filter((article: any) => {
            const articleMenuItemId = Number(article.menu_item_id)
            const menuItemId = Number(item.id)
            const matches = articleMenuItemId === menuItemId
            console.log(`Porównanie: article.menu_item_id=${article.menu_item_id} (${typeof article.menu_item_id}) vs item.id=${item.id} (${typeof item.id}) = ${matches}`)
            return matches
          })
          counts[item.id] = itemArticles.length
          console.log(`Pozycja ${item.title} (ID: ${item.id}): ${itemArticles.length} artykułów`)
        }
        
        console.log('Liczby artykułów:', counts)
        setArticlesCount(counts)
      }
      console.log('=== fetchArticlesCount END ===')
    } catch (error) {
      console.error("Error fetching articles count:", error)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000) // Ukryj po 5 sekundach
  }

  // Funkcja generowania sluga z tytułu
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

  const handleTitleChange = (title: string) => {
    setNewItem({ ...newItem, title })
    // Automatycznie generuj slug jeśli pole slug jest puste
    if (!newItem.slug) {
      setNewItem(prev => ({ ...prev, title, slug: generateSlug(title) }))
    }
  }

  const handleEditTitleChange = (title: string) => {
    setEditingItem(prev => prev ? { ...prev, title } : null)
  }

  const handleSaveItem = async (item: MenuItem) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      })

      if (response.ok) {
        setEditingItem(null)
        fetchMenuItems()
        showMessage('success', 'Pozycja menu została zaktualizowana')
      } else {
        showMessage('error', 'Błąd podczas aktualizacji pozycji menu')
      }
    } catch (error) {
      console.error("Error updating menu item:", error)
      showMessage('error', 'Błąd podczas aktualizacji pozycji menu')
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.title) {
      showMessage('error', 'Tytuł jest wymagany')
      return
    }

    if (!newItem.slug) {
      showMessage('error', 'Slug jest wymagany')
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newItem,
          sort_order: menuItems.length,
          is_active: true,
        }),
      })

      if (response.ok) {
        setNewItem({ 
          title: "", 
          slug: "", 
          parent_id: null,
          display_mode: 'single',
          show_excerpts: false,
          hidden: false
        })
        fetchMenuItems()
        showMessage('success', 'Pozycja menu została dodana pomyślnie')
      } else {
        showMessage('error', 'Błąd podczas dodawania pozycji menu')
      }
    } catch (error) {
      console.error("Error adding menu item:", error)
      showMessage('error', 'Błąd podczas dodawania pozycji menu')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (id: number) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMenuItems()
        showMessage('success', 'Pozycja menu została usunięta')
        setDeletingItem(null)
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Błąd podczas usuwania pozycji menu'
        showMessage('error', errorMessage)
      }
    } catch (error) {
      console.error("Error deleting menu item:", error)
      showMessage('error', 'Błąd podczas usuwania pozycji menu')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      })

      if (response.ok) {
        fetchMenuItems()
      }
    } catch (error) {
      console.error("Error toggling active status:", error)
    }
  }

  const handleToggleHidden = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...item, hidden: !item.hidden }),
      })

      if (response.ok) {
        fetchMenuItems()
      }
    } catch (error) {
      console.error("Error toggling hidden status:", error)
    }
  }

  // Funkcje przeciągania
  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, itemId: number) => {
    e.preventDefault()
    setDragOverItem(itemId)
  }

  const handleDrop = async (e: React.DragEvent, targetItem: MenuItem) => {
    e.preventDefault()
    if (!draggedItem || draggedItem.id === targetItem.id) return

    const draggedIndex = menuItems.findIndex(item => item.id === draggedItem.id)
    const targetIndex = menuItems.findIndex(item => item.id === targetItem.id)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const newItems = [...menuItems]
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, removed)

    // Aktualizuj sort_order dla wszystkich elementów
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sort_order: index
    }))

    try {
      const response = await fetch("/api/admin/menu/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedItems),
      })

      if (response.ok) {
        setMenuItems(updatedItems)
      }
    } catch (error) {
      console.error("Error reordering menu items:", error)
    }

    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  // Funkcja do budowania hierarchii menu
  const buildMenuHierarchy = (items: MenuItem[], parentId: number | null = null): MenuItem[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => ({
        ...item,
        children: buildMenuHierarchy(items, item.id)
      }))
  }

  const renderMenuItem = (item: MenuItem & { children?: MenuItem[] }, level: number = 0) => {
    const isDragging = draggedItem?.id === item.id
    const isDragOver = dragOverItem === item.id

    return (
      <div
        key={item.id}
        className={`border border-gray-200 mb-2 rounded-none ${
          isDragging ? "opacity-50" : ""
        } ${isDragOver ? "border-blue-500 bg-blue-50" : ""}`}
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        onDragOver={(e) => handleDragOver(e, item.id)}
        onDrop={(e) => handleDrop(e, item)}
        onDragEnd={handleDragEnd}
      >
        <div 
          className={`p-4 cursor-move hover:bg-gray-50 ${
            level > 0 ? `ml-${level * 6}` : ""
          }`}
          style={{ marginLeft: level * 24 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-gray-400">⋮⋮</div>
              <div className="flex-1">
                <div className="font-medium text-base text-gray-900">
                  {item.title}
                  {item.hidden ? (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Ukryte</span>
                  ) : (
                    <span className="ml-2 text-xs bg-green-200 text-green-600 px-2 py-1 rounded">Widoczne</span>
                  )}
                </div>
                <div className="text-base text-gray-500">/{item.slug}</div>
                <div className="text-sm text-gray-400">
                  {item.display_mode === 'single' ? 'Pojedynczy artykuł' : 'Lista artykułów'}
                  {item.show_excerpts && ' • Z fragmentami'}
                  {articlesCount[item.id] > 0 && (
                    <span className="ml-2 text-orange-600 font-medium">
                      • {articlesCount[item.id]} artykuł{articlesCount[item.id] === 1 ? '' : articlesCount[item.id] < 5 ? 'y' : 'ów'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={item.is_active}
                onCheckedChange={() => handleToggleActive(item)}
                className="data-[state=checked]:bg-[#2B7CB3]"
              />
              <span className="text-sm text-gray-600">
                {item.is_active ? "Aktywne" : "Nieaktywne"}
              </span>
              
              <Switch
                checked={!item.hidden}
                onCheckedChange={() => handleToggleHidden(item)}
                className="data-[state=checked]:bg-[#2B7CB3]"
              />
              <span className="text-sm text-gray-600">
                {item.hidden ? "Ukryte" : "Widoczne"}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(item)}
                className="rounded-none text-base font-medium"
              >
                Edytuj
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setDeletingItem(item)}
                disabled={articlesCount[item.id] > 0}
                className={`rounded-none text-base font-medium ${
                  articlesCount[item.id] > 0 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                }`}
                title={articlesCount[item.id] > 0 
                  ? `Nie można usunąć - pozycja ma ${articlesCount[item.id]} przypisanych artykułów` 
                  : 'Usuń pozycję menu'
                }
              >
                Usuń
              </Button>
            </div>
          </div>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div className="border-l-2 border-gray-200 ml-6">
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B7CB3]"></div>
        <p className="ml-3 text-base text-gray-600">Ładowanie menu...</p>
      </div>
    )
  }

  const menuHierarchy = buildMenuHierarchy(menuItems)

  return (
    <div className="space-y-6">
      {/* Komunikaty */}
      {message && (
        <div className={`p-4 rounded-none border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">{message.text}</span>
            <button 
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Zarządzanie menu</h1>
          <p className="text-gray-600 text-sm">Konfiguruj strukturę menu strony</p>
        </div>
        <Button 
          onClick={() => setEditingItem(null)} 
          className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-sm font-medium"
        >
          {editingItem ? "Ukryj formularz" : "Dodaj nową pozycję"}
        </Button>
      </div>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="font-medium text-lg">Dodaj nową pozycję menu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Tytuł</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nazwa pozycji menu"
                className="rounded-none text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="slug" className="text-sm font-medium">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={newItem.slug}
                  onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })}
                  placeholder="slug-pozycji-menu"
                  className="rounded-none text-sm flex-1"
                  maxLength={50}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewItem(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                  className="rounded-none text-sm font-medium whitespace-nowrap"
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
              <Label htmlFor="parent_id" className="text-sm font-medium">Pozycja nadrzędna</Label>
              <Select
                value={newItem.parent_id?.toString() || "none"}
                onValueChange={(value) => setNewItem({ ...newItem, parent_id: value === "none" ? null : parseInt(value) })}
              >
                <SelectTrigger className="rounded-none text-sm">
                  <SelectValue placeholder="Brak (pozycja główna)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Brak (pozycja główna)</SelectItem>
                  {menuItems.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="display_mode" className="text-sm font-medium">Tryb wyświetlania</Label>
              <Select
                value={newItem.display_mode}
                onValueChange={(value: 'single' | 'list') => setNewItem({ ...newItem, display_mode: value })}
              >
                <SelectTrigger className="rounded-none text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Pojedynczy artykuł</SelectItem>
                  <SelectItem value="list">Lista artykułów</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show_excerpts"
                checked={newItem.show_excerpts}
                onCheckedChange={(checked) => setNewItem({ ...newItem, show_excerpts: checked })}
                className="data-[state=checked]:bg-[#2B7CB3]"
              />
              <Label htmlFor="show_excerpts" className="text-sm font-medium">Pokaż fragmenty</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hidden"
                checked={newItem.hidden}
                onCheckedChange={(checked) => setNewItem({ ...newItem, hidden: checked })}
                className="rounded-none text-sm font-medium"
              />
              <Label htmlFor="hidden" className="text-sm font-medium">Ukryte w menu</Label>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={handleAddItem}
              disabled={saving}
              className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-sm font-medium"
            >
              {saving ? "Dodawanie..." : "Dodaj pozycję menu"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="font-medium text-lg">Struktura menu</CardTitle>
        </CardHeader>
        <CardContent>
          {menuHierarchy.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Brak pozycji menu</p>
          ) : (
            <div className="space-y-2">
              {menuHierarchy.map(item => renderMenuItem(item))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal edycji */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-none max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edytuj pozycję menu</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">Tytuł</Label>
                <Input
                  id="edit-title"
                  value={editingItem.title}
                  onChange={(e) => handleEditTitleChange(e.target.value)}
                  className="rounded-none text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-slug" className="text-sm font-medium">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-slug"
                    value={editingItem.slug}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="rounded-none text-sm flex-1"
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingItem(prev => prev ? { ...prev, slug: generateSlug(prev.title) } : null)}
                    className="rounded-none text-sm font-medium whitespace-nowrap"
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
                <Label htmlFor="edit-parent_id" className="text-sm font-medium">Pozycja nadrzędna</Label>
                <Select
                  value={editingItem.parent_id?.toString() || "none"}
                  onValueChange={(value) => setEditingItem({ ...editingItem, parent_id: value === "none" ? null : parseInt(value) })}
                >
                  <SelectTrigger className="rounded-none text-sm">
                    <SelectValue placeholder="Brak (pozycja główna)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Brak (pozycja główna)</SelectItem>
                    {menuItems.filter(item => item.id !== editingItem.id).map(item => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-display_mode" className="text-base font-medium">Tryb wyświetlania</Label>
                <Select
                  value={editingItem.display_mode}
                  onValueChange={(value: 'single' | 'list') => setEditingItem({ ...editingItem, display_mode: value })}
                >
                  <SelectTrigger className="rounded-none text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Pojedynczy artykuł</SelectItem>
                    <SelectItem value="list">Lista artykułów</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-show_excerpts"
                  checked={editingItem.show_excerpts}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, show_excerpts: checked })}
                  className="data-[state=checked]:bg-[#2B7CB3]"
                />
                <Label htmlFor="edit-show_excerpts" className="text-base font-medium">Pokaż fragmenty</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-hidden"
                  checked={editingItem.hidden}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, hidden: checked })}
                  className="data-[state=checked]:bg-[#2B7CB3]"
                />
                <Label htmlFor="edit-hidden" className="text-base font-medium">Ukryte w menu</Label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => handleSaveItem(editingItem)}
                disabled={saving}
                className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-base font-medium"
              >
                {saving ? "Zapisywanie..." : "Zapisz"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                disabled={saving}
                className="rounded-none text-base font-medium"
              >
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal potwierdzenia usuwania */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-none max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Potwierdź usunięcie</h3>
            
            <p className="text-base text-gray-600 mb-6">
              Czy na pewno chcesz usunąć pozycję menu <strong>"{deletingItem.title}"</strong>?
              {articlesCount[deletingItem.id] > 0 && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800 font-medium">
                    ⚠️ Nie można usunąć tej pozycji!
                  </p>
                  <p className="text-red-700 text-sm">
                    Pozycja ma {articlesCount[deletingItem.id]} przypisanych artykułów. 
                    Najpierw przenieś lub usuń artykuły.
                  </p>
                </div>
              )}
              <br />
              <span className="text-sm text-red-600">Ta operacja jest nieodwracalna.</span>
            </p>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeletingItem(null)}
                disabled={saving}
                className="rounded-none text-base font-medium"
              >
                Anuluj
              </Button>
              <Button
                onClick={() => handleDeleteItem(deletingItem.id)}
                disabled={saving || articlesCount[deletingItem.id] > 0}
                className={`rounded-none text-base font-medium ${
                  articlesCount[deletingItem.id] > 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {saving ? "Usuwanie..." : "Usuń"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
