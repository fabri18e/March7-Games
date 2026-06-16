'use client'

import { useState } from 'react'
import { SlidersHorizontal, Gamepad2, Users } from 'lucide-react'
import { GAMES, GENRES } from '@/lib/games-data'
import { GameCard } from '@/components/games/GameCard'
import { UserSearchGrid } from '@/components/search/UserSearchGrid'

type SortKey = 'plays' | 'rating' | 'new'
type Tab = 'games' | 'users'

function GamesTab() {
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState<SortKey>('plays')

  const filtered = GAMES
    .filter((g) => genre === 'All' || g.genre === genre)
    .sort((a, b) => {
      if (sort === 'plays') return b.plays - a.plays
      if (sort === 'rating') return b.rating - a.rating
      return (b.new ? 1 : 0) - (a.new ? 1 : 0)
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5">
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {([['plays', 'Most played'], ['rating', 'Top rated'], ['new', 'New']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              sort === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`shrink-0 text-sm px-3.5 py-1.5 rounded-full font-medium transition-colors ${
              genre === g
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="text-5xl">🎮</span>
          <p className="font-semibold">No games found</p>
          <p className="text-sm text-muted-foreground">Try a different genre</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      )}
    </div>
  )
}

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>('games')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Explore</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {tab === 'games' ? `${GAMES.length} games available` : 'Find other players'}
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab('games')}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 border-b-2 transition-colors ${
            tab === 'games'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gamepad2 className="h-4 w-4" /> Games
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 border-b-2 transition-colors ${
            tab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" /> Users
        </button>
      </div>

      {tab === 'games' ? <GamesTab /> : <UserSearchGrid />}
    </div>
  )
}
