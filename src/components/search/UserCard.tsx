import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface UserCardProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export function UserCard({ user }: { user: UserCardProfile }) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all text-center"
    >
      <Avatar className="h-14 w-14">
        <AvatarImage src={user.avatar_url ?? undefined} />
        <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
          {(user.display_name ?? user.username).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{user.display_name ?? user.username}</p>
        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
      </div>
    </Link>
  )
}
