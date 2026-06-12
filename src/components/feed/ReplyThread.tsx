'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function ReplyThread({ commentId, postId, initialReplies, currentUserId, isAdmin = false }: Props) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies as Reply[])
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()

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
              placeholder="Escribe una respuesta..."
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
            Inicia sesión para responder
          </Link>
        </div>
      )}

      {replies.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">Sin respuestas aún. ¡Sé el primero!</p>
      )}

      {replies.map(reply => {
        const canDelete = currentUserId === reply.user_id || isAdmin
        const initials = (reply.profiles.display_name ?? reply.profiles.username).slice(0, 2).toUpperCase()
        return (
          <div key={reply.id} className="flex gap-3 py-3 border-b border-border/50 group/reply">
            <Link href={`/profile/${reply.profiles.username}`} className="shrink-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={reply.profiles.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">{initials}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Link href={`/profile/${reply.profiles.username}`} className="font-semibold text-sm hover:text-primary transition-colors">
                  {reply.profiles.display_name ?? reply.profiles.username}
                </Link>
                <span className="text-xs text-muted-foreground">@{reply.profiles.username}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{timeAgo(reply.created_at)}</span>
                {canDelete && (
                  <button onClick={() => handleDelete(reply.id)}
                    className="ml-auto opacity-0 group-hover/reply:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed break-words mb-2">{reply.content}</p>
              <div className="flex items-center gap-4">
                {currentUserId ? (
                  <button onClick={() => handleLike(reply.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${reply.user_has_liked ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'}`}>
                    <Heart className="h-4 w-4" fill={reply.user_has_liked ? 'currentColor' : 'none'} />
                    {reply.like_count > 0 && <span className="tabular-nums">{reply.like_count}</span>}
                  </button>
                ) : (
                  <Link href="/register" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-rose-400 transition-colors">
                    <Heart className="h-4 w-4" />
                    {reply.like_count > 0 && <span className="tabular-nums">{reply.like_count}</span>}
                  </Link>
                )}
                <Link href={`/reply/${reply.id}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  {reply.reply_count > 0 && <span className="tabular-nums">{reply.reply_count}</span>}
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
