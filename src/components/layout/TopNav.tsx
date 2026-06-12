import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { TopNavClient } from './TopNavClient'
import { SearchBar } from '@/components/search/SearchBar'

interface Props {
  user: User | null
  profile: Profile | null
}

export function TopNav({ user, profile }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/40">
              <Gamepad2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block">March7 Games</span>
          </Link>

          {/* Search — center */}
          <div className="flex flex-1 justify-center px-4">
            <div className="w-full max-w-2xl">
              <SearchBar />
            </div>
          </div>

          {/* User */}
          <div className="ml-auto md:ml-0 shrink-0">
            <TopNavClient user={user} profile={profile} />
          </div>
        </div>
      </div>
    </header>
  )
}
