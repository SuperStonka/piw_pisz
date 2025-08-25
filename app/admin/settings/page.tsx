"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Setting {
  setting_key: string
  setting_value: string
  setting_type: string
  updated_by_name?: string
  updated_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("site")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data: Setting[] = await response.json()
        const settingsMap = data.reduce(
          (acc, setting) => {
            acc[setting.setting_key] = setting.setting_value || ""
            return acc
          },
          {} as Record<string, string>,
        )
        setSettings(settingsMap)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("Ustawienia zostały zapisane")
      } else {
        alert("Błąd podczas zapisywania ustawień")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Błąd podczas zapisywania ustawień")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B7CB3]"></div>
        <p className="ml-3 text-base text-gray-600">Ładowanie ustawień...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Ustawienia strony</h1>
        <p className="text-base text-gray-600">Zarządzaj podstawowymi informacjami o stronie</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("site")}
            className={`py-2 px-1 border-b-2 font-medium text-base ${
              activeTab === "site"
                ? "border-[#2B7CB3] text-[#2B7CB3]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Informacje o stronie
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`py-2 px-1 border-b-2 font-medium text-base ${
              activeTab === "contact"
                ? "border-[#2B7CB3] text-[#2B7CB3]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Dane kontaktowe
          </button>
          <button
            onClick={() => setActiveTab("hours")}
            className={`py-2 px-1 border-b-2 font-medium text-base ${
              activeTab === "hours"
                ? "border-[#2B7CB3] text-[#2B7CB3]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Godziny pracy
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === "site" && (
          <>
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-medium text-lg">Podstawowe informacje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_title" className="text-base font-medium">Tytuł strony</Label>
                  <Input
                    id="site_title"
                    value={settings.site_title || ""}
                    onChange={(e) => handleInputChange("site_title", e.target.value)}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="site_subtitle" className="text-base font-medium">Podtytuł strony</Label>
                  <Input
                    id="site_subtitle"
                    value={settings.site_subtitle || ""}
                    onChange={(e) => handleInputChange("site_subtitle", e.target.value)}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="site_description" className="text-base font-medium">Opis strony</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description || ""}
                    onChange={(e) => handleInputChange("site_description", e.target.value)}
                    rows={3}
                    className="rounded-none text-base"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-medium text-lg">Ustawienia SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_keywords" className="text-base font-medium">Słowa kluczowe (oddzielone przecinkami)</Label>
                  <Textarea
                    id="meta_keywords"
                    value={settings.meta_keywords || ""}
                    onChange={(e) => handleInputChange("meta_keywords", e.target.value)}
                    rows={3}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="google_analytics" className="text-base font-medium">Google Analytics ID</Label>
                  <Input
                    id="google_analytics"
                    value={settings.google_analytics || ""}
                    onChange={(e) => handleInputChange("google_analytics", e.target.value)}
                    placeholder="GA-XXXXXXXXX-X"
                    className="rounded-none text-base"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "contact" && (
          <>
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-medium text-lg">Dane kontaktowe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_address" className="text-base font-medium">Adres</Label>
                  <Textarea
                    id="contact_address"
                    value={settings.contact_address || ""}
                    onChange={(e) => handleInputChange("contact_address", e.target.value)}
                    rows={3}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone" className="text-base font-medium">Telefon</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone || ""}
                    onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_fax" className="text-base font-medium">Fax</Label>
                  <Input
                    id="contact_fax"
                    value={settings.contact_fax || ""}
                    onChange={(e) => handleInputChange("contact_fax", e.target.value)}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email" className="text-base font-medium">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email || ""}
                    onChange={(e) => handleInputChange("contact_email", e.target.value)}
                    className="rounded-none text-base"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-medium text-lg">Godziny pracy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="office_hours" className="text-base font-medium">Godziny pracy</Label>
                  <Textarea
                    id="office_hours"
                    value={settings.office_hours || ""}
                    onChange={(e) => handleInputChange("office_hours", e.target.value)}
                    rows={4}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="office_hours_note" className="text-base font-medium">Dodatkowe informacje</Label>
                  <Textarea
                    id="office_hours_note"
                    value={settings.office_hours_note || ""}
                    onChange={(e) => handleInputChange("office_hours_note", e.target.value)}
                    rows={2}
                    className="rounded-none text-base"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "hours" && (
          <>
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-medium text-lg">Godziny pracy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="office_hours" className="text-base font-medium">Godziny pracy</Label>
                  <Textarea
                    id="office_hours"
                    value={settings.office_hours || ""}
                    onChange={(e) => handleInputChange("office_hours", e.target.value)}
                    rows={4}
                    className="rounded-none text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="office_hours_note" className="text-base font-medium">Dodatkowe informacje</Label>
                  <Textarea
                    id="office_hours_note"
                    value={settings.office_hours_note || ""}
                    onChange={(e) => handleInputChange("office_hours_note", e.target.value)}
                    rows={2}
                    className="rounded-none text-base"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-base font-medium">
          {saving ? "Zapisywanie..." : "Zapisz ustawienia"}
        </Button>
      </div>
    </div>
  )
}
