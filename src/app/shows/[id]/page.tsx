"use client"

import { useState, useEffect, use } from 'react'
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

export default function BookShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [show, setShow] = useState<Show | null>(null)
  const [bookedSeats, setBookedSeats] = useState<number[]>([])
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && id) {
      fetchShowAndBookings()
    }
  }, [user, id])

  const fetchShowAndBookings = async () => {
    const [showRes, bookingsRes] = await Promise.all([
      supabase.from('shows').select('*').eq('id', id).single(),
      supabase.from('bookings').select('seat_numbers').eq('show_id', id).in('status', ['pending', 'confirmed'])
    ])

    if (showRes.data) {
      setShow(showRes.data)
    }

    if (bookingsRes.data) {
      const booked = bookingsRes.data.flatMap(b => b.seat_numbers)
      setBookedSeats(booked)
    }
    setLoading(false)
  }

  const toggleSeat = (seatNum: number) => {
    if (bookedSeats.includes(seatNum)) return
    setSelectedSeats(prev => 
      prev.includes(seatNum) 
        ? prev.filter(s => s !== seatNum)
        : [...prev, seatNum]
    )
  }

  const handleBooking = async () => {
    if (!show || selectedSeats.length === 0) return
    setBooking(true)
    setError('')

    const freshBookings = await supabase
      .from('bookings')
      .select('seat_numbers')
      .eq('show_id', id)
      .in('status', ['pending', 'confirmed'])

    const currentlyBooked = freshBookings.data?.flatMap(b => b.seat_numbers) || []
    const conflict = selectedSeats.some(s => currentlyBooked.includes(s))

    if (conflict) {
      setError('Some seats were just booked. Please select different seats.')
      setBookedSeats(currentlyBooked)
      setSelectedSeats(prev => prev.filter(s => !currentlyBooked.includes(s)))
      setBooking(false)
      return
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: user!.id,
      show_id: id,
      seat_numbers: selectedSeats.sort((a, b) => a - b),
      status: 'pending',
      total_amount: selectedSeats.length * show.price
    })

    if (insertError) {
      setError('Booking failed. Please try again.')
      setBooking(false)
      return
    }

    router.push('/bookings')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || !show) return null

  const rows = Math.ceil(show.total_seats / 10)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/shows" className="font-semibold text-foreground hover:text-primary transition-colors">TicketHub</Link>
          <div className="flex items-center gap-1">
            <Link href="/shows">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Back to Shows</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="border border-border rounded-lg p-5 bg-card mb-6">
          <h1 className="text-xl font-semibold text-foreground mb-1">{show.name}</h1>
          <p className="text-muted-foreground text-sm mb-3">{show.description}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded">{show.venue}</span>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded">{new Date(show.date).toLocaleString()}</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium">₹{show.price}/seat</span>
          </div>
        </div>

        <div className="border border-border rounded-lg p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-foreground">Select Your Seats</h2>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-muted border border-border"></div>
                <span className="text-muted-foreground">Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span className="text-muted-foreground">Selected</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-destructive/30"></div>
                <span className="text-muted-foreground">Booked</span>
              </span>
            </div>
          </div>

          <div className="mb-6 text-center">
            <div className="bg-muted py-2 px-8 rounded text-muted-foreground text-xs font-medium inline-block">
              STAGE
            </div>
          </div>

          <div className="grid gap-1.5 justify-center mb-6">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex gap-1.5 justify-center">
                <span className="w-5 text-muted-foreground text-xs flex items-center justify-center">
                  {String.fromCharCode(65 + rowIndex)}
                </span>
                {Array.from({ length: 10 }, (_, colIndex) => {
                  const seatNum = rowIndex * 10 + colIndex + 1
                  if (seatNum > show.total_seats) return null
                  const isBooked = bookedSeats.includes(seatNum)
                  const isSelected = selectedSeats.includes(seatNum)

                  return (
                    <button
                      key={seatNum}
                      onClick={() => toggleSeat(seatNum)}
                      disabled={isBooked}
                      className={`w-7 h-7 rounded text-[10px] font-medium transition-all ${
                        isBooked 
                          ? 'bg-destructive/20 text-destructive/50 cursor-not-allowed' 
                          : isSelected 
                            ? 'bg-primary text-primary-foreground scale-105 shadow-sm' 
                            : 'bg-muted text-muted-foreground hover:bg-accent border border-border'
                      }`}
                    >
                      {colIndex + 1}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-foreground">Selected: {selectedSeats.length} seat(s)</p>
                {selectedSeats.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    {selectedSeats.sort((a, b) => a - b).map(s => {
                      const row = String.fromCharCode(65 + Math.floor((s - 1) / 10))
                      const col = ((s - 1) % 10) + 1
                      return `${row}${col}`
                    }).join(', ')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-foreground">
                  ₹{(selectedSeats.length * show.price).toFixed(2)}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || booking}
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
