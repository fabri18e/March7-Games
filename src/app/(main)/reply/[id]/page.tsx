import { notFound } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { getEffectiveSession } from '@/lib/effective-session'
import { getCommentById, getCommentReplies, addComment, toggleCommentLike } from '@/actions/posts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ReplyThread } from '@/components/feed/ReplyThread'

interface Props {
  params: Promise<{ id: string }>
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default async function ReplyPage({ params }: Props) {
  const { id } = await params
  const { user, isAdmin } = await getEffectiveSession()

  const [comment, replies] = await Promise.all([
    getCommentById(id),
    getCommentReplies(id),
  ])

  if (!comment) notFound()

  const profile = comment.profiles as { username: string; display_name: string | null; avatar_url: string | null }
  const initials = (profile.display_name ?? profile.username).slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/post/${comment.post_id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-3"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al post
      </Link>

      {/* Parent comment shown as a post */}
      <div className="bg-card border border-border rounded-xl p-4 mb-1">
        <div className="flex gap-3">
          <Link href={`/profile/${profile.username}`} className="shrink-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Link href={`/profile/${profile.username}`} className="font-semibold text-sm hover:text-primary transition-colors">
                {profile.display_name ?? profile.username}
              </Link>
              <span className="text-xs text-muted-foreground">@{profile.username}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed break-words mb-3">{comment.content}</p>
            <div className="flex items-center gap-4 pt-2 border-t border-border/50">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" fill={comment.user_has_liked ? 'currentColor' : 'none'} style={comment.user_has_liked ? { color: 'rgb(251 113 133)' } : {}} />
                {comment.like_count > 0 && <span className="tabular-nums">{comment.like_count}</span>}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                {comment.reply_count > 0 && <span className="tabular-nums">{comment.reply_count}</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reply stream */}
      <ReplyThread
        commentId={id}
        postId={comment.post_id}
        initialReplies={replies}
        currentUserId={user?.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}
