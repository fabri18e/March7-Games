'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LikeButton } from './LikeButton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toggleCommentLike, deleteComment } from '@/actions/posts'

interface Props {
  comment: {
    id: string
    content: string
    created_at: string
    user_id: string
    like_count: number
    user_has_liked: boolean
    reply_count: number
    post_id: string
    profiles: {
      username: string
      display_name: string | null
      avatar_url: string | null
    }
  }
  currentUserId?: string
  isAdmin?: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function CommentCard({ comment, currentUserId, isAdmin = false }: Props) {
  const { profiles: profile } = comment
  const initials = (profile.display_name ?? profile.username).slice(0, 2).toUpperCase()
  const canDelete = currentUserId === comment.user_id || isAdmin
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await deleteComment(comment.id)
      router.push(`/post/${comment.post_id}`)
    })
  }

  return (
    <>
      <article className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/profile/${profile.username}`} className="shrink-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link href={`/profile/${profile.username}`} className="font-semibold text-sm hover:text-primary transition-colors">
                {profile.display_name ?? profile.username}
              </Link>
              <span className="text-muted-foreground text-xs">@{profile.username}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-muted-foreground text-xs">{timeAgo(comment.created_at)}</span>
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90 mb-3">
          {comment.content}
        </p>

        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          {currentUserId ? (
            <LikeButton
              postId={comment.id}
              initialLiked={comment.user_has_liked}
              initialCount={comment.like_count}
              onToggle={toggleCommentLike}
            />
          ) : (
            <Link href="/register" className="flex items-center gap-1.5 text-sm text-muted-foreground px-1 hover:text-red-500 transition-colors">
              <span className="tabular-nums">{comment.like_count}</span>
            </Link>
          )}
        </div>
      </article>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar respuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la respuesta y todas sus sub-respuestas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
