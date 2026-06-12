'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Flame, Star, Clock, Search, SlidersHorizontal } from 'lucide-react'

const GAMES = [
  { id: '1', title: 'Pixel Dungeon',  genre: 'RPG',        plays: 1240, rating: 4.8, color: 'from-violet-600 to-indigo-800',  emoji: '⚔️',  hot: true,  new: false },
  { id: '2', title: 'Space Drift',    genre: 'Arcade',     plays: 890,  rating: 4.5, color: 'from-cyan-600 to-blue-800',      emoji: '🚀',  hot: false, new: true  },
  { id: '3', title: 'Block Puzzle',   genre: 'Puzzle',     plays: 3100, rating: 4.9, color: 'from-emerald-600 to-teal-800',   emoji: '🧩',  hot: true,  new: false },
  { id: '4', title: 'Neon Runner',    genre: 'Plataformer',plays: 670,  rating: 4.3, color: 'from-pink-600 to-rose-800',      emoji: '🏃',  hot: false, new: true  },
  { id: '5', title: 'Tower Wars',     genre: 'Estrategia', plays: 2050, rating: 4.7, color: 'from-amber-600 to-orange-800',   emoji: '🏰',  hot: true,  new: false },
  { id: '6', title: 'Cave Explorer',  genre: 'Aventura',   plays: 430,  rating: 4.1, color: 'from-stone-600 to-zinc-800',     emoji: '🗿',  hot: false, new: true  },
  { id: '7', title: 'Astro Jump',     genre: 'Arcade',     plays: 1870, rating: 4.6, color: 'from-blue-600 to-purple-800',    emoji: '🌙',  hot: true,  new: false },
  { id: '8', title: 'Rune Forge',     genre: 'RPG',        plays: 990,  rating: 4.4, color: 'from-red-600 to-rose-900',       emoji: '🔮',  hot: false, new: false },
  { id: '9', title: 'Frostbite',      genre: 'Plataformer',plays: 560,  rating: 4.2, color: 'from-sky-500 to-blue-700',       emoji: '❄️',  hot: false, new: true  },
  { id: '10', title: 'Shadow Maze',   genre: 'Aventura',   plays: 780,  rating: 4.0, color: 'from-gray-600 to-slate-800',     emoji: '🌑',  hot: false, new: false },
  { id: '11', title: 'Laser Grid',    genre: 'Puzzle',     plays: 1450, rating: 4.6, color: 'from-lime-600 to-green-800',     emoji: '🔦',  hot: true,  new: false },
  { id: '12', title: 'Mech Brawler',  genre: 'Estrategia', plays: 620,  rating: 4.3, color: 'from-orange-600 to-red-800',     emoji: '🤖',  hot: false, new: true  },
]

const GENRES = ['Todos', 'RPG', 'Arcade', 'Puzzle', 'Plataformer', 'Estrategia', 'Aventura']

type SortKey = 'plays' | 'rating' | 'new'

function formatPlays(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function GameCard({ game }: { game: typeof GAMES[0] }) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-200"
    >
      <div className={`relative h-36 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
        <span className="text-5xl">{game.emoji}</span>
        <div className="absolute top-2 left-2 flex gap-1">
          {game.hot && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold bg-orange-500 text-white rounded px-1.5 py-0.5">
              <Flame className="h-2.5 w-2.5" /> Popular
            </span>
          )}
          {game.new && (
            <span className="text-[10px] font-bold bg-emerald-500 text-white rounded px-1.5 py-0.5">
              Nuevo
            </span>
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="font-semibold text-sm leading-tight">{game.title}</p>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-muted-foreground">{game.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-primary bg-primary/10 rounded px-1.5 py-0.5 font-medium">
            {game.genre}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Play className="h-3 w-3" />
            {formatPlays(game.plays)}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('Todos')
  const [sort, setSort] = useState<SortKey>('plays')

  const filtered = GAMES
    .filter((g) => genre === 'Todos' || g.genre === genre)
    .filter((g) => g.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'plays') return b.plays - a.plays
      if (sort === 'rating') return b.rating - a.rating
      return (b.new ? 1 : 0) - (a.new ? 1 : 0)
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Explorar juegos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{GAMES.length} juegos disponibles</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar juego..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-background transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          {([['plays', 'Más jugados'], ['rating', 'Mejor valorados'], ['new', 'Nuevos']] as const).map(([key, label]) => (
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
      </div>

      {/* Genre pills */}
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="text-5xl">🎮</span>
          <p className="font-semibold">No se encontraron juegos</p>
          <p className="text-sm text-muted-foreground">Prueba con otro género o búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      )}
    </div>
  )
}
