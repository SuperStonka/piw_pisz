"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Debug: sprawdź czy strona się ładuje
  useEffect(() => {
    console.log("Login page loaded")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", username)
      
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()
      console.log("Login response:", result)

      if (result.success) {
        console.log("Login successful, setting session...")
        
        // Zapisz sesję w localStorage
        localStorage.setItem("adminSession", JSON.stringify(result.user))
        
        // Ustaw cookie dla sesji (żeby middleware mógł sprawdzić)
        const cookieValue = `adminSession=${JSON.stringify(result.user)}; path=/; max-age=86400`
        document.cookie = cookieValue
        console.log("Cookie set:", cookieValue)
        
        // Przekieruj do panelu admin
        console.log("Redirecting to /admin...")
        router.push("/admin")
      } else {
        setError(result.error || "Błąd podczas logowania")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Wystąpił błąd podczas logowania")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-none">
        <CardHeader className="bg-[#2B7CB3] text-white rounded-none">
          <CardTitle className="text-center font-normal">Panel Administracyjny CMS</CardTitle>
          <p className="text-center text-blue-100 text-sm">Powiatowy Inspektorat Weterynarii w Piszu</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Nazwa użytkownika</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-none"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 border border-red-200 rounded-none">{error}</div>
            )}
            <Button type="submit" className="w-full bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none" disabled={isLoading}>
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Domyślne dane logowania:</p>
            <p>
              Użytkownik: <strong>admin</strong>
            </p>
            <p>
              Hasło: <strong>admin123</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
