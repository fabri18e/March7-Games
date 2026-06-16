'use client'

import { useState, useTransition } from 'react'
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
  flat?: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export function PostCard({ post, currentUserId, isAdmin = false, hideComments = false, flat = false }: Props) {
  const { profiles: profile } = post
  const initials = (profile.display_name ?? profile.username).slice(0, 2).toUpperCase()
  const canDelete = currentUserId === profile.id || isAdmin
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await deletePost(post.id)
      router.refresh()
    })
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <article
      onClick={() => !flat && router.push(`/post/${post.id}`)}
      className={flat ? '' : 'bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-200 cursor-pointer'}
    >
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${profile.username}`} onClick={stop}>
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
              onClick={stop}
              className="font-semibold text-sm hover:text-primary transition-colors"
            >
              {profile.display_name ?? profile.username}
            </Link>
            <span className="text-muted-foreground text-xs">@{profile.username}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={stop}>
          <span className="text-muted-foreground text-xs">{timeAgo(post.created_at)}</span>
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90 mb-3">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/50" onClick={stop}>
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

        {!hideComments && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground rounded-full px-2 py-1 -ml-2 transition-colors hover:text-primary hover:bg-primary/10">
            <MessageCircle className="h-4 w-4" />
            {post.comment_count != null && (
              <span className="tabular-nums">{post.comment_count}</span>
            )}
          </span>
        )}
      </div>

      {!hideComments && (post.comment_count ?? 0) > 0 && (
        <CommentPreview postId={post.id} commentCount={post.comment_count ?? 0} />
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent onClick={stop}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete the post and all its replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}
