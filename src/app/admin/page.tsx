"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
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

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; showId: string | null; showName: string }>({ open: false, showId: null, showName: '' })
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    total_seats: '100',
    price: ''
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchShows()
    }
  }, [user])

  const fetchShows = async () => {
    const { data } = await supabase
      .from('shows')
      .select('*')
      .order('date', { ascending: true })
    setShows(data || [])
    setLoading(false)
  }

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    const { error } = await supabase.from('shows').insert({
      name: form.name,
      description: form.description,
      date: new Date(form.date).toISOString(),
      venue: form.venue,
      total_seats: parseInt(form.total_seats),
      price: parseFloat(form.price)
    })

    if (!error) {
      setForm({ name: '', description: '', date: '', venue: '', total_seats: '100', price: '' })
      setShowForm(false)
      fetchShows()
    }
    setCreating(false)
  }

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteDialog({ open: true, showId: id, showName: name })
  }

  const handleDeleteShow = async () => {
    if (!deleteDialog.showId) return
    setDeleting(true)
    await supabase.from('shows').delete().eq('id', deleteDialog.showId)
    setDeleting(false)
    setDeleteDialog({ open: false, showId: null, showName: '' })
    fetchShows()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">TicketHub</Link>
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Manage Shows</h1>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {showForm ? 'Cancel' : '+ Create Show'}
          </Button>
        </div>

        {showForm && (
          <div className="border border-border rounded-lg p-5 bg-card mb-6">
            <h2 className="font-medium text-foreground mb-4">New Show</h2>
            <form onSubmit={handleCreateShow} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Show Name</label>
                <Input
                  placeholder="Enter show name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-background border-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Venue</label>
                <Input
                  placeholder="Enter venue"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  required
                  className="bg-background border-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="bg-background border-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Total Seats</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={form.total_seats}
                  onChange={(e) => setForm({ ...form, total_seats: e.target.value })}
                  required
                  className="bg-background border-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Price per Seat</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="bg-background border-input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <Textarea
                  placeholder="Enter show description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-background border-input"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {creating ? 'Creating...' : 'Create Show'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {shows.length === 0 ? (
            <div className="border border-border rounded-lg p-8 text-center bg-card">
              <p className="text-muted-foreground">No shows yet. Create your first show!</p>
            </div>
          ) : (
            shows.map((show) => (
              <div key={show.id} className="border border-border rounded-lg p-5 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{show.name}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5 line-clamp-1">{show.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded">{show.venue}</span>
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded">{new Date(show.date).toLocaleString()}</span>
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded">{show.total_seats} seats</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium">₹{show.price}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteDialog(show.id, show.name)}
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Show</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteDialog.showName}</span>? This will also delete all associated bookings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, showId: null, showName: '' })}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteShow}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Show'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
