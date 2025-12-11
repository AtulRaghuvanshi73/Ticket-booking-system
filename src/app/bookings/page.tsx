"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import Link from 'next/link'

type Booking = {
  id: string
  seat_numbers: number[]
  status: 'pending' | 'confirmed' | 'cancelled'
  total_amount: number
  created_at: string
  shows: {
    name: string
    date: string
    venue: string
  }
}

export default function BookingsPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; bookingId: string | null; showName: string }>({ open: false, bookingId: null, showName: '' })
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, shows(name, date, venue)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setBookings(data as Booking[] || [])
    setLoading(false)
  }

  const openCancelDialog = (bookingId: string, showName: string) => {
    setCancelDialog({ open: true, bookingId, showName })
  }

  const handleCancel = async () => {
    if (!cancelDialog.bookingId) return
    setCancelling(true)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', cancelDialog.bookingId)
    setCancelling(false)
    setCancelDialog({ open: false, bookingId: null, showName: '' })
    fetchBookings()
  }

  const handleConfirm = async (bookingId: string) => {
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId)
    fetchBookings()
  }

  const formatSeats = (seats: number[]) => {
    return seats.sort((a, b) => a - b).map(s => {
      const row = String.fromCharCode(65 + Math.floor((s - 1) / 10))
      const col = ((s - 1) % 10) + 1
      return `${row}${col}`
    }).join(', ')
  }

  const statusConfig = {
    pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    confirmed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }
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
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">TicketHub</Link>
          <div className="flex items-center gap-1">
            <Link href="/shows">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Shows</Button>
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-6">My Bookings</h1>

        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="border border-border rounded-lg p-8 text-center bg-card">
              <p className="text-muted-foreground mb-4">You haven&apos;t made any bookings yet.</p>
              <Link href="/shows">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Shows</Button>
              </Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="border border-border rounded-lg p-5 bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{booking.shows.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[booking.status].bg} ${statusConfig[booking.status].text}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{booking.shows.venue}</span>
                      <span>{new Date(booking.shows.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Seats: </span>
                        <span className="font-mono text-foreground">{formatSeats(booking.seat_numbers)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-semibold text-primary">${booking.total_amount}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Booked on {new Date(booking.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleConfirm(booking.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Confirm
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openCancelDialog(booking.id, booking.shows.name)}
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openCancelDialog(booking.id, booking.shows.name)}
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking for <span className="font-medium text-foreground">{cancelDialog.showName}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialog({ open: false, bookingId: null, showName: '' })}
              disabled={cancelling}
            >
              Keep Booking
            </Button>
            <Button 
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
