'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Trash2, Send, Heart, MoreHorizontal } from 'lucide-react'
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
import { SubReplyPreview } from './SubReplyPreview'
import { addComment, deleteComment, toggleCommentLike, getCommentReplies } from '@/actions/posts'

interface Reply {
  id: string
  content: string
  created_at: string
  user_id: string
  like_count: number
  user_has_liked: boolean
  reply_count: number
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

interface Props {
  commentId: string
  postId: string
  initialReplies: Reply[]
  currentUserId?: string
  isAdmin?: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

function ReplyRow({
  reply,
  canDelete,
  initials,
  router,
  stop,
  currentUserId,
  onDelete,
}: {
  reply: Reply
  canDelete: boolean
  initials: string
  router: ReturnType<typeof useRouter>
  stop: (e: React.MouseEvent) => void
  currentUserId?: string
  onDelete: (id: string) => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <>
      <div
        onClick={() => router.push(`/reply/${reply.id}`)}
        className="flex gap-3 py-3 border-b border-border/50 group/reply cursor-pointer hover:bg-accent/20 transition-colors"
      >
        <Link href={`/profile/${reply.profiles.username}`} onClick={stop} className="shrink-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={reply.profiles.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Link href={`/profile/${reply.profiles.username}`} onClick={stop} className="font-semibold text-sm hover:text-primary transition-colors">
              {reply.profiles.display_name ?? reply.profiles.username}
            </Link>
            <span className="text-xs text-muted-foreground">@{reply.profiles.username}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{timeAgo(reply.created_at)}</span>
            {canDelete && (
              <div onClick={stop} className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed break-words mb-2">{reply.content}</p>
          <div className="flex items-center gap-3 pt-2 border-t border-border/50" onClick={stop}>
            {currentUserId ? (
              <LikeButton
                postId={reply.id}
                initialLiked={reply.user_has_liked}
                initialCount={reply.like_count}
                onToggle={toggleCommentLike}
              />
            ) : (
              <Link href="/register" className="flex items-center gap-1.5 text-sm text-muted-foreground px-1 hover:text-red-500 transition-colors">
                <Heart className="h-4 w-4" />
                <span className="tabular-nums">{reply.like_count}</span>
              </Link>
            )}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground rounded-full px-2 py-1 -ml-2 transition-colors hover:text-primary hover:bg-primary/10">
              <MessageCircle className="h-4 w-4" />
              {reply.reply_count > 0 && <span className="tabular-nums">{reply.reply_count}</span>}
            </span>
          </div>
        </div>
      </div>
      {reply.reply_count > 0 && (
        <SubReplyPreview commentId={reply.id} replyCount={reply.reply_count} />
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reply?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete the reply and all its sub-replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(reply.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function ReplyThread({ commentId, postId, initialReplies, currentUserId, isAdmin = false }: Props) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies as Reply[])
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  async function reload() {
    const data = await getCommentReplies(commentId)
    setReplies(data as Reply[])
  }

  function handleAdd() {
    const content = text.trim()
    if (!content) return
    setText('')
    startTransition(async () => {
      await addComment(postId, content, commentId)
      await reload()
    })
  }

  function handleDelete(replyId: string) {
    startTransition(async () => {
      await deleteComment(replyId)
      setReplies(prev => prev.filter(r => r.id !== replyId))
    })
  }

  function handleLike(replyId: string) {
    setReplies(prev => prev.map(r =>
      r.id === replyId
        ? { ...r, like_count: r.user_has_liked ? r.like_count - 1 : r.like_count + 1, user_has_liked: !r.user_has_liked }
        : r
    ))
    startTransition(async () => { await toggleCommentLike(replyId) })
  }

  return (
    <div>
      {/* Input */}
      {currentUserId ? (
        <div className="flex gap-3 py-3 border-b border-border/50">
          <div className="w-9 shrink-0" />
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() } }}
              placeholder="Write a reply..."
              maxLength={400}
              className="flex-1 text-sm bg-muted/40 border border-border rounded-full px-4 py-2 outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
            />
            <button
              onClick={handleAdd}
              disabled={!text.trim() || isPending}
              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="py-3 border-b border-border/50">
          <Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Log in to reply
          </Link>
        </div>
      )}

      {replies.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">No replies yet. Be the first!</p>
      )}

      {replies.map(reply => {
        const canDelete = currentUserId === reply.user_id || isAdmin
        const initials = (reply.profiles.display_name ?? reply.profiles.username).slice(0, 2).toUpperCase()
        return (
          <ReplyRow
            key={reply.id}
            reply={reply}
            canDelete={canDelete}
            initials={initials}
            router={router}
            stop={stop}
            currentUserId={currentUserId}
            onDelete={handleDelete}
          />
        )
      })}
    </div>
  )
}
