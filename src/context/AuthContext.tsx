"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string
  role: 'user' | 'admin'
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .eq('password', password)
      .single()

    if (error || !data) {
      return { error: 'Invalid credentials' }
    }

    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    return {}
  }

  const register = async (email: string, password: string) => {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return { error: 'Email already exists' }
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ email, password, role: 'user' })
      .select('id, email, role')
      .single()

    if (error || !data) {
      return { error: 'Registration failed' }
    }

    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    return {}
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
