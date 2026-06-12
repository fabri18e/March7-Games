'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LikeButton } from './LikeButton'
import { CommentPreview } from './CommentPreview'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { deletePost } from '@/actions/posts'
import type { Profile } from '@/types/database'

interface Post {
  id: string
  content: string
  created_at: string
  profiles: Profile
  like_count: number
  user_has_liked: boolean
  comment_count?: number
}

interface Props {
  post: Post
  currentUserId?: string
  isAdmin?: boolean
  hideComments?: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function PostCard({ post, currentUserId, isAdmin = false, hideComments = false }: Props) {
  const { profiles: profile } = post
  const initials = (profile.display_name ?? profile.username).slice(0, 2).toUpperCase()
  const canDelete = currentUserId === profile.id || isAdmin
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deletePost(post.id)
      router.refresh()
    })
  }

  return (
    <article className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${profile.username}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/profile/${profile.username}`}
              className="font-semibold text-sm hover:text-primary transition-colors"
            >
              {profile.display_name ?? profile.username}
            </Link>
            <span className="text-muted-foreground text-xs">@{profile.username}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-muted-foreground text-xs">{timeAgo(post.created_at)}</span>
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Opciones"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content — click goes to post page */}
      <Link href={`/post/${post.id}`} className="block mb-3 group/content">
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90 group-hover/content:text-foreground transition-colors">
          {post.content}
        </p>
      </Link>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
        {currentUserId ? (
          <LikeButton
            postId={post.id}
            initialLiked={post.user_has_liked}
            initialCount={post.like_count}
          />
        ) : (
          <Link
            href="/register"
            className="flex items-center gap-1.5 text-sm text-muted-foreground px-1 hover:text-rose-400 transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span className="tabular-nums">{post.like_count}</span>
          </Link>
        )}

        {/* Comment bubble — always a link to post page */}
        {!hideComments && (
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground px-1 hover:text-primary transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {post.comment_count != null && (
              <span className="tabular-nums">{post.comment_count}</span>
            )}
          </Link>
        )}
      </div>

      {/* 1 comment preview — compact, inside the card */}
      {!hideComments && (post.comment_count ?? 0) > 0 && (
        <CommentPreview postId={post.id} commentCount={post.comment_count ?? 0} />
      )}
    </article>
  )
}
