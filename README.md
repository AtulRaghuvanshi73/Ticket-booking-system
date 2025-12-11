# TicketHub

TicketHub is a modern web application for ticket booking and event management. Built with Next.js and powered by Supabase, it provides a seamless experience for users to browse upcoming shows, book tickets, and manage their reservations. Admins can create and manage events through a dedicated dashboard.

## Features

- **User Authentication**: Secure login and registration with role-based access (user and admin).
- **Show Management**: Browse upcoming shows with details like date, venue, price, and available seats.
- **Ticket Booking**: Easy booking process with seat selection and payment integration (via Supabase).
- **Bookings Dashboard**: View and manage personal bookings, including cancellation options.
- **Admin Panel**: Create, edit, and delete shows; manage event details.
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS and Radix UI components.
- **Dark/Light Theme**: Toggle between themes for better user experience.
- **Real-time Updates**: Integrated with Supabase for real-time data synchronization.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form with resolvers
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Bun
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AtulRaghuvanshi73/Ticket-booking-system
   cd Ticket-booking-system
   ```

2. Install dependencies:
   ```bash
   npm i 
   or
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

Ensure your Supabase database has the following tables:
- `users` (managed by Supabase Auth)
- `shows` (id, name, description, date, venue, total_seats, price)
- `bookings` (id, user_id, show_id, seat_numbers, status, total_amount, created_at)

## Usage

- **Home Page**: Landing page with navigation to login/register.
- **Login/Register**: Authenticate to access the app.
- **Shows**: View upcoming events and book tickets.
- **Bookings**: Manage your ticket reservations.
- **Admin**: (Admin role only) Manage shows and events.

## Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

