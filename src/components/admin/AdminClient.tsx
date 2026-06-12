'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Shield, ShieldOff, Users, Newspaper, BarChart3, Eye, AlertTriangle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { adminDeletePost, adminDeleteUser, adminToggleAdmin, setPreviewMode } from '@/actions/admin'
import type { Profile } from '@/types/database'

type Tab = 'stats' | 'posts' | 'users'

interface Post {
  id: string
  content: string
  created_at: string
  profiles: { username: string; display_name: string | null; avatar_url: string | null }
}

interface Props {
  currentUserId: string
  users: Profile[]
  posts: Post[]
  stats: { totalUsers: number; totalPosts: number; totalLikes: number; totalGames: number }
  currentPreviewMode?: string
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export function AdminClient({ currentUserId, users, posts, stats, currentPreviewMode = 'admin' }: Props) {
  const [tab, setTab] = useState<Tab>('stats')
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const router = useRouter()

  function handlePreview(mode: 'admin' | 'user' | 'guest') {
    startTransition(async () => {
      await setPreviewMode(mode)
      router.push('/')
      router.refresh()
    })
  }

  function handleDeletePost(postId: string) {
    startTransition(async () => {
      await adminDeletePost(postId)
      setConfirmDelete(null)
      router.refresh()
    })
  }

  function handleDeleteUser(userId: string) {
    startTransition(async () => {
      await adminDeleteUser(userId)
      setConfirmDelete(null)
      router.refresh()
    })
  }

  function handleToggleAdmin(userId: string, current: boolean) {
    startTransition(async () => {
      await adminToggleAdmin(userId, current)
      router.refresh()
    })
  }

  const TABS = [
    { key: 'stats' as Tab, label: 'Estadísticas', icon: BarChart3 },
    { key: 'posts' as Tab, label: 'Posts', icon: Newspaper },
    { key: 'users' as Tab, label: 'Usuarios', icon: Users },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Panel de administración</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona usuarios, posts y contenido</p>
        </div>

        {/* Preview mode */}
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Ver como:</span>
          {(['admin', 'user', 'guest'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handlePreview(mode)}
              disabled={isPending}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                mode === currentPreviewMode
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {mode === 'admin' ? 'Admin' : mode === 'user' ? 'Usuario' : 'Invitado'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Usuarios', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
            { label: 'Posts', value: stats.totalPosts, icon: Newspaper, color: 'text-emerald-400' },
            { label: 'Likes', value: stats.totalLikes, icon: BarChart3, color: 'text-rose-400' },
            { label: 'Juegos', value: stats.totalGames, icon: BarChart3, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {tab === 'posts' && (
        <div className="space-y-2">
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No hay posts</p>
          )}
          {posts.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-xl p-4 flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={post.profiles.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {post.profiles.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{post.profiles.display_name ?? post.profiles.username}</span>
                  <span className="text-xs text-muted-foreground">@{post.profiles.username}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{timeAgo(post.created_at)}</span>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">{post.content}</p>
              </div>
              {confirmDelete === post.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-destructive">¿Eliminar?</span>
                  <button onClick={() => handleDeletePost(post.id)} disabled={isPending}
                    className="text-xs bg-destructive text-white px-2 py-1 rounded font-medium hover:bg-destructive/80 transition-colors">
                    Sí
                  </button>
                  <button onClick={() => setConfirmDelete(null)}
                    className="text-xs border border-border px-2 py-1 rounded font-medium hover:bg-accent transition-colors">
                    No
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(post.id)}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={user.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{user.display_name ?? user.username}</span>
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                  {user.is_admin && (
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">Admin</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString('es-ES')}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {user.id !== currentUserId && (
                  <>
                    <button
                      onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                      disabled={isPending}
                      title={user.is_admin ? 'Quitar admin' : 'Hacer admin'}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      {user.is_admin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </button>
                    {confirmDelete === user.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-destructive">¿Eliminar?</span>
                        <button onClick={() => handleDeleteUser(user.id)} disabled={isPending}
                          className="text-xs bg-destructive text-white px-2 py-1 rounded font-medium hover:bg-destructive/80 transition-colors">
                          Sí
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-xs border border-border px-2 py-1 rounded font-medium hover:bg-accent transition-colors">
                          No
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(user.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
                {user.id === currentUserId && (
                  <span className="text-xs text-muted-foreground italic">Tú</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
