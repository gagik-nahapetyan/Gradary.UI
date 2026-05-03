import React, { createContext, useCallback, useEffect, useState } from 'react'
import { TOKEN_KEY } from '@/api/client'
import type { LoginResponse, UserDto, UserRole } from '@/types/api'

interface AuthContextValue {
  user: UserDto | null
  token: string | null
  login: (response: LoginResponse) => void
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isLibrarian: boolean
  isMember: boolean
  hasRole: (...roles: UserRole[]) => boolean
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)

const USER_KEY = 'ol_user'

// Backend may have sent role as integer before JsonStringEnumConverter was added.
// Normalize to string so role checks always work regardless of cached data age.
const ROLE_MAP: Record<number, UserRole> = { 1: 'Admin', 2: 'Librarian', 3: 'Member' }

function normalizeUser(user: UserDto): UserDto {
  if (typeof (user.role as unknown) === 'number') {
    return { ...user, role: ROLE_MAP[user.role as unknown as number] ?? user.role }
  }
  return user
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserDto | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? normalizeUser(JSON.parse(stored) as UserDto) : null
  })

  // Sync state when storage changes in another tab
  useEffect(() => {
    const handler = () => {
      setToken(localStorage.getItem(TOKEN_KEY))
      const stored = localStorage.getItem(USER_KEY)
      setUser(stored ? normalizeUser(JSON.parse(stored) as UserDto) : null)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const login = useCallback((response: LoginResponse) => {
    const user = normalizeUser(response.user)
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(response.accessToken)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user]
  )

  const value: AuthContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'Admin',
    isLibrarian: user?.role === 'Librarian',
    isMember: user?.role === 'Member',
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
