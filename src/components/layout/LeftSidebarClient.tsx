'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { signOut } from '@/actions/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  user: User | null
  profile: Profile | null
}

export function LeftSidebarClient({ user, profile }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!user) {
    return (
      <div className="flex flex-col gap-2 mt-2 pb-2">
        <Button
          className="rounded-full font-semibold"
          onClick={() => router.push('/register')}
        >
          <span className="hidden xl:block">Registrarse</span>
          <span className="xl:hidden text-lg">+</span>
        </Button>
        <Button
          variant="outline"
          className="rounded-full hidden xl:flex"
          onClick={() => router.push('/login')}
        >
          Iniciar sesión
        </Button>
      </div>
    )
  }

  const initials = (profile?.username ?? user.email ?? '?').slice(0, 2).toUpperCase()
  const displayName = profile?.display_name ?? profile?.username ?? user.email ?? ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 p-3 rounded-full hover:bg-accent transition-colors w-fit xl:w-full cursor-pointer outline-none mt-2">
        {isPending ? (
          <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" />
        ) : (
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="hidden xl:flex flex-col items-start min-w-0 flex-1">
          <span className="font-semibold text-sm truncate w-full text-left">{displayName}</span>
          <span className="text-xs text-muted-foreground truncate w-full text-left">
            @{profile?.username ?? user.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-52">
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={() => startTransition(() => signOut())}
          disabled={isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
