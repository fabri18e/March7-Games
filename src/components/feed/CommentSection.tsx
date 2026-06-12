'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Send, Trash2, MessageCircle, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getComments, addComment, deleteComment, toggleCommentLike } from '@/actions/posts'

interface RawComment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id: string | null
  like_count: number
  user_has_liked: boolean
  reply_count: number
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

interface CommentWithReplies extends RawComment {
  replies: RawComment[]
}

interface Props {
  postId: string
  currentUserId?: string
  isAdmin?: boolean
  preview?: boolean
  commentCount?: number
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function buildTree(flat: RawComment[]): CommentWithReplies[] {
  const top = flat.filter(c => !c.parent_id)
  return top.map(c => ({ ...c, replies: flat.filter(r => r.parent_id === c.id) }))
}

function ReplyInput({
  placeholder,
  prefix,
  onSubmit,
  isPending,
}: {
  placeholder: string
  prefix?: string
  onSubmit: (text: string) => void
  isPending: boolean
}) {
  const [text, setText] = useState(prefix ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setText(prefix ?? '')
    if (inputRef.current) {
      inputRef.current.focus()
      const len = (prefix ?? '').length
      inputRef.current.setSelectionRange(len, len)
    }
  }, [prefix])

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <div className="flex gap-3 py-3 border-b border-border/50">
      <div className="w-8 shrink-0" />
      <div className="flex-1 flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder={placeholder}
          maxLength={400}
          autoFocus
          className="flex-1 text-sm bg-muted/40 border border-border rounded-full px-4 py-2 outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || isPending}
          className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function CommentRow({
  comment,
  currentUserId,
  isAdmin,
  onDelete,
  onReply,
  onLike,
  isReplying,
  depth = 0,
}: {
  comment: RawComment
  currentUserId?: string
  isAdmin: boolean
  onDelete: (id: string) => void
  onLike: (id: string) => void
  depth?: number
}) {
  const canDelete = currentUserId === comment.user_id || isAdmin
  const initials = (comment.profiles.display_name ?? comment.profiles.username).slice(0, 2).toUpperCase()

  return (
    <div className={`flex gap-3 py-3 group/comment ${depth === 0 ? 'border-b border-border/50' : ''}`}>
      <Link href={`/profile/${comment.profiles.username}`} className="shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <Link href={`/profile/${comment.profiles.username}`} className="font-semibold text-sm hover:text-primary transition-colors">
            {comment.profiles.display_name ?? comment.profiles.username}
          </Link>
          <span className="text-xs text-muted-foreground">@{comment.profiles.username}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ml-auto opacity-0 group-hover/comment:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-foreground/90 leading-relaxed break-words mb-2">{comment.content}</p>

        {/* Footer — identical to PostCard */}
        <div className="flex items-center gap-4">
          {currentUserId ? (
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                comment.user_has_liked ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'
              }`}
            >
              <Heart className="h-4 w-4" fill={comment.user_has_liked ? 'currentColor' : 'none'} />
              {comment.like_count > 0 && <span className="tabular-nums">{comment.like_count}</span>}
            </button>
          ) : (
            <Link href="/register" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-rose-400 transition-colors">
              <Heart className="h-4 w-4" />
              {comment.like_count > 0 && <span className="tabular-nums">{comment.like_count}</span>}
            </Link>
          )}

          {/* Reply bubble — shows count and navigates to /reply/[id] */}
          <Link
            href={`/reply/${comment.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {comment.reply_count > 0 && <span className="tabular-nums">{comment.reply_count}</span>}
          </Link>
        </div>
      </div>
    </div>
  )
}

export function CommentSection({ postId, currentUserId, isAdmin = false, preview = false, commentCount }: Props) {
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function reload() {
    const data = await getComments(postId)
    setComments(buildTree(data as RawComment[]))
  }

  useEffect(() => {
    startTransition(async () => {
      await reload()
      setLoaded(true)
    })
  }, [postId])

  function handleAdd(content: string, parentId?: string) {
    startTransition(async () => {
      await addComment(postId, content, parentId)
      setReplyingTo(null)
      await reload()
    })
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteComment(commentId)
      await reload()
    })
  }

  function handleLike(commentId: string) {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) return { ...c, like_count: c.user_has_liked ? c.like_count - 1 : c.like_count + 1, user_has_liked: !c.user_has_liked }
      return { ...c, replies: c.replies.map(r => r.id === commentId ? { ...r, like_count: r.user_has_liked ? r.like_count - 1 : r.like_count + 1, user_has_liked: !r.user_has_liked } : r) }
    }))
    startTransition(async () => { await toggleCommentLike(commentId) })
  }

  // ── PREVIEW MODE (feed) ──────────────────────────────────────────────────
  if (preview) {
    const last = comments[comments.length - 1]
    const hiddenCount = Math.max(0, (commentCount ?? comments.length) - 1)

    if (!loaded || !last) return null

    const initials = (last.profiles.display_name ?? last.profiles.username).slice(0, 2).toUpperCase()
    return (
      <Link href={`/post/${postId}`} className="block mt-2 pt-2 border-t border-border/40 group/preview">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarImage src={last.profiles.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">{initials}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground truncate group-hover/preview:text-foreground transition-colors">
            <span className="font-semibold text-foreground/70">{last.profiles.display_name ?? last.profiles.username}</span>
            {' '}{last.content}
          </p>
        </div>
        {hiddenCount > 0 && (
          <p className="text-xs text-primary mt-1 pl-7">Ver {hiddenCount} respuesta{hiddenCount !== 1 ? 's' : ''} más</p>
        )}
      </Link>
    )
  }

  // ── FULL MODE (post page) ────────────────────────────────────────────────
  const topLevel = comments

  return (
    <div className="mt-2">
      {/* Main input */}
      {currentUserId ? (
        <div className="flex gap-3 py-3 border-b border-border/50">
          <div className="w-9 shrink-0" />
          <div className="flex-1 flex gap-2">
            <input
              placeholder="Escribe un comentario..."
              maxLength={400}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (val) { handleAdd(val);(e.target as HTMLInputElement).value = '' }
                }
              }}
              className="flex-1 text-sm bg-muted/40 border border-border rounded-full px-4 py-2 outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
            />
            <button
              disabled={isPending}
              onClick={e => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                const val = input?.value.trim()
                if (val) { handleAdd(val); input.value = '' }
              }}
              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="py-3 border-b border-border/50">
          <Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Inicia sesión para responder
          </Link>
        </div>
      )}

      {/* Skeleton */}
      {!loaded && (
        <div className="flex gap-3 py-3 animate-pulse">
          <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-muted rounded w-24" />
            <div className="h-3 bg-muted rounded w-48" />
          </div>
        </div>
      )}

      {loaded && topLevel.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">Sin respuestas aún. ¡Sé el primero!</p>
      )}

      {/* Comment stream */}
      {loaded && topLevel.map(comment => (
        <div key={comment.id}>
          <CommentRow
            comment={comment}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onLike={handleLike}
            depth={0}
          />

          {/* Replies (inline preview — click bubble to see more) */}
          {comment.replies.map(reply => (
            <div key={reply.id} className="pl-12">
              <CommentRow
                comment={reply}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onDelete={handleDelete}
                onLike={handleLike}
                depth={1}
              />
            </div>
          ))}

        </div>
      ))}
    </div>
  )
}
