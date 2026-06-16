import { Gamepad2, Users, Search } from 'lucide-react'
import { searchGames } from '@/lib/game-search'
import { GameCard } from '@/components/games/GameCard'
import { UserCard } from '@/components/search/UserCard'
import { searchProfiles } from '@/actions/search'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <Search className="h-10 w-10 text-muted-foreground" />
        <p className="font-semibold">Search games or users</p>
        <p className="text-sm text-muted-foreground">Type something in the search bar</p>
      </div>
    )
  }

  const games = searchGames(query)
  const users = await searchProfiles(query, 12)

  const noResults = games.length === 0 && users.length === 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Results for &ldquo;{query}&rdquo;</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {games.length} game{games.length !== 1 ? 's' : ''} · {users.length} user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {noResults ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="text-5xl">🔍</span>
          <p className="font-semibold">No results found</p>
          <p className="text-sm text-muted-foreground">Try a different search</p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm">Games</h2>
            </div>
            {games.length === 0 ? (
              <p className="text-sm text-muted-foreground">No games for this search.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {games.map((g) => <GameCard key={g.id} game={g} />)}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm">Users</h2>
            </div>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users for this search.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {users.map((u) => <UserCard key={u.id} user={u} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
