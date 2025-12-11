"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

type Show = {
  id: string
  name: string
  description: string
  date: string
  venue: string
  total_seats: number
  price: number
}

export default function ShowsPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchShows()
    }
  }, [user])

  const fetchShows = async () => {
    const { data } = await supabase
      .from('shows')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
    setShows(data || [])
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">TicketHub</Link>
          <div className="flex items-center gap-1">
            <Link href="/bookings">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">My Bookings</Button>
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Admin</Button>
              </Link>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Available Shows</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {shows.length === 0 ? (
            <div className="md:col-span-2 border border-border rounded-lg p-8 text-center bg-card">
              <p className="text-muted-foreground">No shows available at the moment.</p>
            </div>
          ) : (
            shows.map((show) => (
              <div key={show.id} className="border border-border rounded-lg p-5 bg-card hover:shadow-sm hover:border-primary/30 transition-all">
                <h3 className="font-medium text-foreground mb-1">{show.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{show.description}</p>
                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  <span className="bg-muted text-muted-foreground px-2 py-1 rounded">{show.venue}</span>
                  <span className="bg-muted text-muted-foreground px-2 py-1 rounded">
                    {new Date(show.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} @ {new Date(show.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium">₹{show.price}/seat</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{show.total_seats} seats</span>
                  <Link href={`/shows/${show.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Book Now</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
