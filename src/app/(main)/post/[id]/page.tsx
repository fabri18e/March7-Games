import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getEffectiveSession } from '@/lib/effective-session'
import { PostCard } from '@/components/feed/PostCard'
import { CommentSection } from '@/components/feed/CommentSection'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const { user, isAdmin, supabase } = await getEffectiveSession()

  const { data: rawPost } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(*), likes(count), comments(count)')
    .eq('id', id)
    .single()

  if (!rawPost) notFound()

  let userHasLiked = false
  if (user) {
    const { data } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .maybeSingle()
    userHasLiked = !!data
  }

  const post = {
    ...rawPost,
    like_count: (rawPost.likes as Array<{ count: number }>)?.[0]?.count ?? 0,
    comment_count: (rawPost.comments as Array<{ count: number }>)?.[0]?.count ?? 0,
    user_has_liked: userHasLiked,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-3"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <PostCard
        post={post as Parameters<typeof PostCard>[0]['post']}
        currentUserId={user?.id}
        isAdmin={isAdmin}
        hideComments
      />

      <CommentSection
        postId={id}
        currentUserId={user?.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}
