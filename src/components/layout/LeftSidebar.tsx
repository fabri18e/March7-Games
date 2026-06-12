'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Upload, User as UserIcon, ChevronsLeft, ChevronsRight, Settings, ShieldCheck, Eye } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface Props {
  user: User | null
  profile: Profile | null
  isAdmin?: boolean
  previewMode?: string
}

export function LeftSidebar({ user, profile, isAdmin = false, previewMode = 'admin' }: Props) {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/explore', icon: Compass, label: 'Explorar' },
    {
      href: user && profile ? `/profile/${profile.username}` : '/register',
      icon: UserIcon,
      label: 'Perfil',
    },
    { href: user ? '/games/upload' : '/register', icon: Upload, label: 'Subir juego' },
    { href: '/settings', icon: Settings, label: 'Ajustes' },
    ...(isAdmin ? [{ href: '/admin', icon: ShieldCheck, label: 'Admin' }] : []),
  ]

  return (
    <aside
      className={`sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 border-r border-border flex flex-col py-2 transition-all duration-200 overflow-hidden ${
        open ? 'w-40' : 'w-12'
      }`}
    >
      {/* Toggle button — top */}
      <div className="px-2 pb-1">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 shadow-[inset_0_0_12px_rgba(139,92,246,0.08)] transition-colors w-full ${
            open ? 'px-3 py-2 justify-end' : 'justify-center p-2.5'
          }`}
          title={open ? 'Colapsar' : 'Expandir'}
        >
          {open ? <ChevronsLeft className="h-4 w-4 shrink-0" /> : <ChevronsRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={label}
              href={href}
              title={!open ? label : undefined}
              className={`flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors ${
                open ? 'px-3 py-2' : 'justify-center p-2.5'
              } ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(52,211,153,0.08)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {open && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Preview mode badge */}
      {isAdmin && previewMode !== 'admin' && (
        <div className={`mx-2 mb-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium ${
          previewMode === 'guest'
            ? 'bg-amber-500/10 text-amber-400'
            : 'bg-blue-500/10 text-blue-400'
        }`}>
          <Eye className="h-3 w-3 shrink-0" />
          {open && <span>Modo {previewMode === 'guest' ? 'invitado' : 'usuario'}</span>}
        </div>
      )}
    </aside>
  )
}
