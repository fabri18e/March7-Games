'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, LogOut, Settings, Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { signOut } from '@/actions/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  user: User | null
  profile: Profile | null
}

export function TopNavClient({ user, profile }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
          Iniciar sesión
        </Button>
        <Button size="sm" className="rounded-full" onClick={() => router.push('/register')}>
          Registrarse
        </Button>
      </div>
    )
  }

  const initials = (profile?.username ?? user.email ?? '?').slice(0, 2).toUpperCase()
  const displayName = profile?.display_name ?? profile?.username ?? user.email ?? ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none cursor-pointer">
        {isPending ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Avatar className="h-8 w-8 ring-2 ring-border hover:ring-primary transition-colors">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm">{displayName}</span>
            <span className="text-xs text-muted-foreground">@{profile?.username ?? user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push(`/profile/${profile?.username}`)}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
