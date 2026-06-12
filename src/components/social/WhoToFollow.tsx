import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export async function WhoToFollow({ currentUserId, isGuest }: { currentUserId?: string, isGuest?: boolean }) {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .order('created_at', { ascending: false })
    .limit(5)

  if (currentUserId) {
    query = query.neq('id', currentUserId)
  }

  const { data: users } = await query

  if (!users || users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No hay usuarios aún. ¡Sé el primero en registrarte!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <Link href={`/profile/${user.username}`} className="shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${user.username}`}
              className="hover:underline underline-offset-2"
            >
              <p className="font-semibold text-sm truncate leading-tight">
                {user.display_name ?? user.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{user.username}
              </p>
            </Link>
          </div>

          <Link href={isGuest ? '/register' : `/profile/${user.username}`}>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs px-4 shrink-0 font-semibold"
            >
              Seguir
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}
