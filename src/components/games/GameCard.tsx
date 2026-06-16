import Link from 'next/link'
import { Play, Flame, Star } from 'lucide-react'
import { formatPlays, type Game } from '@/lib/games-data'

export function GameCard({ game }: { game: Game }) {
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
              New
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
