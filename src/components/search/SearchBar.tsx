'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { searchProfiles } from '@/actions/search'

type Result = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchProfiles(query)
        setResults(data)
        setOpen(true)
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

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-full px-3 py-2 focus-within:border-primary focus-within:bg-background transition-colors">
        {isPending ? (
          <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
        />
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 py-3">
              Sin resultados para "{query}"
            </p>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => goToProfile(user.username)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
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
            ))
          )}
        </div>
      )}
    </div>
  )
}
