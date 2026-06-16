import Fuse from 'fuse.js'
import { GAMES, type Game } from './games-data'

const fuse = new Fuse(GAMES, {
  keys: ['title', 'genre'],
  threshold: 0.35,
  ignoreLocation: true,
})

export function searchGames(query: string): Game[] {
  if (!query.trim()) return []
  return fuse.search(query).map((result) => result.item)
}
