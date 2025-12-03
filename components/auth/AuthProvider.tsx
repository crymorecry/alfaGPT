'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
interface User {
  id: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const fetchUser = async () => {
    let user2 = null
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        user2 = data.user
      } else {
        setUser(null)
        user2 = null
        router.push('/login')
      }
    } catch (error) {
      setUser(null)
      user2 = null
    } finally {
      if (user2 == null && (pathname === '/login' || pathname === '/en/login')) {
        setLoading(false)
      }else if(user2 != null && (pathname === '/login' || pathname === '/en/login')) {
        router.push('/')
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {loading ? (<div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin" /></div>) : (children)}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

