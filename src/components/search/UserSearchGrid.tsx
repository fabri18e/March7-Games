'use client'

import { useState, useEffect, useTransition } from 'react'
import { Search, Users } from 'lucide-react'
import { searchProfiles } from '@/actions/search'
import { UserCard, type UserCardProfile } from './UserCard'

type Result = UserCardProfile

export function UserSearchGrid() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [searched, setSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSearched(false)
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchProfiles(query, 30)
        setResults(data)
        setSearched(true)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search users by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-muted/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-background transition-colors"
        />
      </div>

      {!searched && !isPending && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Users className="h-10 w-10 text-muted-foreground" />
          <p className="font-semibold">Search for players</p>
          <p className="text-sm text-muted-foreground">Type a username to get started</p>
        </div>
      )}

      {searched && !isPending && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="text-5xl">🔍</span>
          <p className="font-semibold">No users found</p>
          <p className="text-sm text-muted-foreground">Try a different name</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {results.map((user) => <UserCard key={user.id} user={user} />)}
        </div>
      )}
    </div>
  )
}
