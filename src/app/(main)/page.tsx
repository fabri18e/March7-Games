import { Flame, Sparkles, TrendingUp } from 'lucide-react'
import { GameCarousel } from '@/components/games/GameCarousel'
import { GAMES } from '@/lib/games-data'

export default function HomePage() {
  const destacados = GAMES.filter((g) => g.hot)
  const populares = [...GAMES].sort((a, b) => b.plays - a.plays)
  const nuevos = GAMES.filter((g) => g.new)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Welcome to March7 Games</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Discover and play the best games from the community</p>
      </div>

      <GameCarousel title="Featured" icon={<Flame className="h-4 w-4 text-primary" />} games={destacados} viewAllHref="/explore" />
      <GameCarousel title="Popular" icon={<TrendingUp className="h-4 w-4 text-primary" />} games={populares} viewAllHref="/explore" />
      <GameCarousel title="New" icon={<Sparkles className="h-4 w-4 text-primary" />} games={nuevos} viewAllHref="/explore" />
    </div>
  )
}
