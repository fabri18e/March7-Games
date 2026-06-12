import { Suspense } from 'react'
import { getEffectiveSession } from '@/lib/effective-session'
import { WhoToFollow } from '@/components/social/WhoToFollow'
import { CreatePost } from '@/components/feed/CreatePost'
import { GuestPostPrompt } from '@/components/feed/GuestPostPrompt'
import { PostCard } from '@/components/feed/PostCard'
import { Card, CardContent } from '@/components/ui/card'
import { Gamepad2, Flame } from 'lucide-react'

export default async function FeedPage() {
  const { user, profile, isAdmin, supabase } = await getEffectiveSession()

  const { data: rawPosts } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(*), likes(count), comments(count)')
    .order('created_at', { ascending: false })
    .limit(50)

  let likedSet = new Set<string>()
  if (user && rawPosts && rawPosts.length > 0) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', rawPosts.map((p) => p.id))
    likedSet = new Set(userLikes?.map((l) => l.post_id) ?? [])
  }

  const posts = (rawPosts ?? []).map((p) => ({
    ...p,
    like_count: (p.likes as Array<{ count: number }>)?.[0]?.count ?? 0,
    comment_count: (p.comments as Array<{ count: number }>)?.[0]?.count ?? 0,
    user_has_liked: likedSet.has(p.id),
  }))

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-4">
        {profile ? <CreatePost profile={profile} /> : <GuestPostPrompt />}

        {posts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gamepad2 className="h-7 w-7 text-primary" />
            </div>
            <p className="font-semibold">Aún no hay publicaciones</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {user ? '¡Sé el primero en publicar algo!' : 'Regístrate para publicar.'}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post as Parameters<typeof PostCard>[0]['post']}
              currentUserId={user?.id}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0 border-l border-border pl-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm">Jugadores activos</h2>
            </div>
            <Suspense
              fallback={
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted rounded w-20" />
                        <div className="h-2.5 bg-muted rounded w-14" />
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <WhoToFollow currentUserId={user?.id} />
            </Suspense>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
