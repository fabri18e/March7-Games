'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, LogOut, Settings, Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { signOut } from '@/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface NavbarClientProps {
  user: User | null
  profile: Profile | null
}

export function NavbarClient({ user, profile }: NavbarClientProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
          Log in
        </Button>
        <Button size="sm" onClick={() => router.push('/register')}>
          Sign up
        </Button>
      </div>
    )
  }

  const initials = (profile?.username ?? user.email ?? '?')
    .slice(0, 2)
    .toUpperCase()

  const displayName = profile?.display_name ?? profile?.username ?? user.email ?? '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative h-8 w-8 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
        aria-label="User menu"
      >
        {isPending ? (
          <div className="h-8 w-8 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={profile?.avatar_url ?? undefined}
              alt={displayName}
            />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm">
              @{profile?.username ?? 'user'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push(`/profile/${profile?.username}`)}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          My profile
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={() => startTransition(() => signOut())}
          disabled={isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
