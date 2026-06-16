'use client'

import { useState, useEffect, useRef, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Gamepad2, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { searchProfiles } from '@/actions/search'
import { searchGames } from '@/lib/game-search'

type UserResult = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const gameResults = useMemo(() => searchGames(query).slice(0, 4), [query])

  // Debounced user search (game search is local/instant via Fuse)
  useEffect(() => {
    if (!query.trim()) {
      setUserResults([])
      setOpen(false)
      return
    }

    setOpen(true)
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchProfiles(query, 4)
        setUserResults(data)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function goToProfile(username: string) {
    setOpen(false)
    setQuery('')
    router.push(`/profile/${username}`)
  }

  function goToGame(id: string) {
    setOpen(false)
    setQuery('')
    router.push(`/games/${id}`)
  }

  function goToSearch() {
    const trimmed = query.trim()
    if (!trimmed) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const hasResults = gameResults.length > 0 || userResults.length > 0

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-full px-3 py-2 focus-within:border-primary focus-within:bg-background transition-colors">
        {isPending ? (
          <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
        ) : (
          <button onClick={goToSearch} aria-label="Search" className="shrink-0">
            <Search className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        )}
        <input
          type="text"
          placeholder="Search games or users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') goToSearch() }}
          className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
        />
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {!hasResults ? (
            <p className="text-sm text-muted-foreground px-4 py-3">
              No results for "{query}"
            </p>
          ) : (
            <>
              {gameResults.length > 0 && (
                <div className="py-1">
                  <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Gamepad2 className="h-3 w-3" /> Games
                  </p>
                  {gameResults.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => goToGame(game.id)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-left"
                    >
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-sm shrink-0`}>
                        {game.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{game.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{game.genre}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {userResults.length > 0 && (
                <div className="py-1">
                  <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Users className="h-3 w-3" /> Users
                  </p>
                  {userResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => goToProfile(user.username)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-left"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={user.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {user.display_name ?? user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <button
            onClick={goToSearch}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-accent transition-colors text-left border-t border-border"
          >
            <Search className="h-3.5 w-3.5" />
            See all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  )
}
