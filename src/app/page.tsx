"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/shows')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-foreground">TicketHub</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            Book your seats for the best shows
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Simple, fast, and reliable ticket booking. Find your favorite shows and secure your seats in seconds.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* <div className="mt-20 grid grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="text-3xl font-bold text-primary mb-1">100+</div>
            <div className="text-muted-foreground text-sm">Shows Available</div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="text-3xl font-bold text-primary mb-1">5000+</div>
            <div className="text-muted-foreground text-sm">Happy Customers</div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="text-3xl font-bold text-primary mb-1">50+</div>
            <div className="text-muted-foreground text-sm">Venues</div>
          </div>
        </div> */}
      </main>
    </div>
  )
}
