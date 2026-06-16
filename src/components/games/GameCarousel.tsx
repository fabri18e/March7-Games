'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { Play, ChevronRight, ChevronLeft } from 'lucide-react'
import { formatPlays, type Game } from '@/lib/games-data'

interface Props {
  title: string
  icon: ReactNode
  games: Game[]
  viewAllHref?: string
}

export function GameCarousel({ title, icon, games, viewAllHref }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 0)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [])

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  if (games.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-bold text-sm">{title}</h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="relative">
        {canLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-9 w-9 rounded-full bg-background border border-border shadow-lg shadow-black/40 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-none">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group shrink-0 w-36 rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className={`h-24 bg-gradient-to-br ${game.color} flex items-center justify-center relative`}>
                <span className="text-4xl">{game.emoji}</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold leading-tight truncate">{game.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-primary bg-primary/10 rounded px-1.5 py-0.5 font-medium">
                    {game.genre}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{formatPlays(game.plays)} plays</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {canRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-9 w-9 rounded-full bg-background border border-border shadow-lg shadow-black/40 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  )
}
