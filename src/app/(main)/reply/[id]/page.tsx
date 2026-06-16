import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getEffectiveSession } from '@/lib/effective-session'
import { getCommentById, getCommentReplies } from '@/actions/posts'
import { CommentCard } from '@/components/feed/CommentCard'
import { ReplyThread } from '@/components/feed/ReplyThread'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReplyPage({ params }: Props) {
  const { id } = await params
  const { user, isAdmin } = await getEffectiveSession()

  const [comment, replies] = await Promise.all([
    getCommentById(id),
    getCommentReplies(id),
  ])

  if (!comment) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between py-3">
        {comment.parent_id ? (
          <>
            <Link
              href={`/reply/${comment.parent_id}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous reply
            </Link>
            <Link
              href={`/post/${comment.post_id}`}
              className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors"
            >
              Back to post
            </Link>
          </>
        ) : (
          <Link
            href={`/post/${comment.post_id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to post
          </Link>
        )}
      </div>

      <CommentCard comment={comment as Parameters<typeof CommentCard>[0]['comment']} currentUserId={user?.id} isAdmin={isAdmin} />

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
