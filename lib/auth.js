import { User } from "./models/User.js"

// Prosty system logowania bez NextAuth
export const simpleAuth = {
  // Sprawdź dane logowania
  async authenticate(username, password) {
    try {
      const user = await User.getByUsername(username)
      
      if (!user) {
        return { success: false, error: "Nieprawidłowa nazwa użytkownika" }
      }

      const isValidPassword = await User.verifyPassword(user, password)
      
      if (!isValidPassword) {
        return { success: false, error: "Nieprawidłowe hasło" }
      }

      return { 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    } catch (error) {
      console.error("Authentication error:", error)
      return { success: false, error: "Błąd podczas logowania" }
    }
  },

  // Sprawdź czy użytkownik jest zalogowany (z sesji)
  isAuthenticated(session) {
    return session && session.user && session.user.id
  },

  // Sprawdź role użytkownika
  hasRole(session, requiredRole) {
    if (!this.isAuthenticated(session)) return false
    return session.user.role === requiredRole || session.user.role === "admin"
  }
}
