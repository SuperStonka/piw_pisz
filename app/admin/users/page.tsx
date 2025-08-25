"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  username: string
  imie: string | null
  nazwisko: string | null
  email: string
  role: string
  created_at: string
  updated_at: string
}

export default function UsersPage() {
  const [session, setSession] = useState(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({
    username: "",
    imie: "",
    nazwisko: "",
    email: "",
    password: "",
    role: "editor",
  })

  useEffect(() => {
    // Pobierz sesję z localStorage
    const adminSession = localStorage.getItem("adminSession")
    if (adminSession) {
      try {
        const userData = JSON.parse(adminSession)
        setSession({ user: userData })
        
        // Sprawdź czy użytkownik ma uprawnienia admin
        if (userData.role === "admin") {
          fetchUsers()
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error parsing session:", error)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        setNewUser({ username: "", imie: "", nazwisko: "", email: "", password: "", role: "editor" })
        setShowAddForm(false)
        fetchUsers()
      } else {
        alert("Błąd podczas dodawania użytkownika")
      }
    } catch (error) {
      console.error("Error adding user:", error)
      alert("Błąd podczas dodawania użytkownika")
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert("Błąd podczas usuwania użytkownika")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Błąd podczas usuwania użytkownika")
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B7CB3] mx-auto"></div>
        <p className="mt-2 text-gray-600 text-base">Ładowanie...</p>
      </div>
    )
  }

  if (!session || session.user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-base">Brak uprawnień do zarządzania użytkownikami</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Użytkownicy</h1>
          <p className="text-gray-600 text-sm">Zarządzaj użytkownikami systemu</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-sm font-medium"
        >
          {showAddForm ? "Ukryj formularz" : "Dodaj użytkownika"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="font-medium text-lg">Dodaj nowego użytkownika</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium">Nazwa użytkownika</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    className="rounded-none text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="imie" className="text-sm font-medium">Imię</Label>
                  <Input
                    id="imie"
                    value={newUser.imie}
                    onChange={(e) => setNewUser({ ...newUser, imie: e.target.value })}
                    className="rounded-none text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="nazwisko" className="text-sm font-medium">Nazwisko</Label>
                  <Input
                    id="nazwisko"
                    value={newUser.nazwisko}
                    onChange={(e) => setNewUser({ ...newUser, nazwisko: e.target.value })}
                    className="rounded-none text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="rounded-none text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">Hasło</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    className="rounded-none text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-sm font-medium">Rola</Label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-sm"
                  >
                    <option value="editor">Edytor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#2B7CB3] hover:bg-[#1E5A87] rounded-none text-sm font-medium">
                  Dodaj użytkownika
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-none text-sm font-medium"
                >
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="font-medium text-lg">Lista użytkowników</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nazwa użytkownika</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Imię i nazwisko</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Rola</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Data utworzenia</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.username}</td>
                    <td className="px-4 py-3 text-sm">
                      {user.imie && user.nazwisko ? `${user.imie} ${user.nazwisko}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="rounded-none text-sm"
                      >
                        {user.role === "admin" ? "Administrator" : "Edytor"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(user.created_at).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="rounded-none text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={user.id === session.user.id}
                      >
                        Usuń
                      </Button>
                    </td>
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
