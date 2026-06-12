import Link from 'next/link'
import { Gamepad2, Home, Compass, Upload } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { NavbarClient } from './NavbarClient'

interface NavbarProps {
  user: User | null
  profile: Profile | null
}

export function Navbar({ user, profile }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
              <Gamepad2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:block text-sm tracking-tight">March7 Games</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-0.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:block">Inicio</span>
            </Link>
            <Link
              href="/explore"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:block">Explorar</span>
            </Link>
            <Link
              href="/games/upload"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:block">Subir juego</span>
            </Link>
          </nav>

          {/* User menu */}
          <NavbarClient user={user} profile={profile} />
        </div>
      </div>
    </header>
  )
}
