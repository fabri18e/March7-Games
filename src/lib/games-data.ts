export interface Game {
  id: string
  title: string
  genre: string
  plays: number
  rating: number
  color: string
  emoji: string
  hot: boolean
  new: boolean
}

export const GAMES: Game[] = [
  { id: '1', title: 'Pixel Dungeon', genre: 'RPG', plays: 1240, rating: 4.8, color: 'from-violet-600 to-indigo-800', emoji: '⚔️', hot: true, new: false },
  { id: '2', title: 'Space Drift', genre: 'Arcade', plays: 890, rating: 4.5, color: 'from-cyan-600 to-blue-800', emoji: '🚀', hot: false, new: true },
  { id: '3', title: 'Block Puzzle', genre: 'Puzzle', plays: 3100, rating: 4.9, color: 'from-emerald-600 to-teal-800', emoji: '🧩', hot: true, new: false },
  { id: '4', title: 'Neon Runner', genre: 'Platformer', plays: 670, rating: 4.3, color: 'from-pink-600 to-rose-800', emoji: '🏃', hot: false, new: true },
  { id: '5', title: 'Tower Wars', genre: 'Strategy', plays: 2050, rating: 4.7, color: 'from-amber-600 to-orange-800', emoji: '🏰', hot: true, new: false },
  { id: '6', title: 'Cave Explorer', genre: 'Adventure', plays: 430, rating: 4.1, color: 'from-stone-600 to-zinc-800', emoji: '🗿', hot: false, new: true },
  { id: '7', title: 'Astro Jump', genre: 'Arcade', plays: 1870, rating: 4.6, color: 'from-blue-600 to-purple-800', emoji: '🌙', hot: true, new: false },
  { id: '8', title: 'Rune Forge', genre: 'RPG', plays: 990, rating: 4.4, color: 'from-red-600 to-rose-900', emoji: '🔮', hot: false, new: false },
  { id: '9', title: 'Frostbite', genre: 'Platformer', plays: 560, rating: 4.2, color: 'from-sky-500 to-blue-700', emoji: '❄️', hot: false, new: true },
  { id: '10', title: 'Shadow Maze', genre: 'Adventure', plays: 780, rating: 4.0, color: 'from-gray-600 to-slate-800', emoji: '🌑', hot: false, new: false },
  { id: '11', title: 'Laser Grid', genre: 'Puzzle', plays: 1450, rating: 4.6, color: 'from-lime-600 to-green-800', emoji: '🔦', hot: true, new: false },
  { id: '12', title: 'Mech Brawler', genre: 'Strategy', plays: 620, rating: 4.3, color: 'from-orange-600 to-red-800', emoji: '🤖', hot: false, new: true },
]

export const GENRES = ['All', 'RPG', 'Arcade', 'Puzzle', 'Platformer', 'Strategy', 'Adventure']

export function formatPlays(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}
