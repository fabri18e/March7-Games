import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CalendarDays, Gamepad2, Newspaper } from 'lucide-react'
import { getEffectiveSession } from '@/lib/effective-session'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FollowButton } from '@/components/profile/FollowButton'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { ProfileMenu } from '@/components/profile/ProfileMenu'
import { PostCard } from '@/components/feed/PostCard'
import Link from 'next/link'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username} — March7 Games`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const { user: currentUser, isAdmin: currentUserIsAdmin, supabase } = await getEffectiveSession()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) notFound()

  // Fetch counts in parallel
  const [
    { count: followersCount },
    { count: followingCount },
    { count: postsCount },
    { count: gamesCount },
  ] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id),
    supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id),
  ])

  // Check if the current user follows this profile
  let isFollowing = false
  if (currentUser && currentUser.id !== profile.id) {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    isFollowing = !!data
  }

  // Fetch posts for this profile
  const { data: rawPosts } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(*), likes(count), comments(count)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  let likedSet = new Set<string>()
  if (currentUser && rawPosts && rawPosts.length > 0) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUser.id)
      .in('post_id', rawPosts.map((p) => p.id))
    likedSet = new Set(userLikes?.map((l) => l.post_id) ?? [])
  }

  const posts = (rawPosts ?? []).map((p) => ({
    ...p,
    like_count: (p.likes as Array<{ count: number }>)?.[0]?.count ?? 0,
    comment_count: (p.comments as Array<{ count: number }>)?.[0]?.count ?? 0,
    user_has_liked: likedSet.has(p.id),
  }))

  const isOwner = currentUser?.id === profile.id
  const initials = profile.username.slice(0, 2).toUpperCase()
  const joinedDate = new Date(profile.created_at).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto space-y-0">
      {/* Banner */}
      <div className="h-32 rounded-t-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-background border border-b-0 border-border overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Profile card */}
      <div className="border border-border rounded-b-2xl bg-card px-6 pb-6">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          <Avatar className="h-20 w-20 ring-4 ring-card">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 pt-12">
            {isOwner ? (
              <EditProfileModal profile={profile} />
            ) : currentUser ? (
              <FollowButton
                targetUserId={profile.id}
                initialIsFollowing={isFollowing}
              />
            ) : (
              <Link href="/register">
                <button className="px-4 py-1.5 rounded-full text-sm font-semibold border border-border hover:bg-accent transition-colors">
                  Seguir
                </button>
              </Link>
            )}
            {currentUserIsAdmin && !isOwner && (
              <ProfileMenu userId={profile.id} />
            )}
          </div>
        </div>

        {/* Name + username */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold leading-tight">
              {profile.display_name ?? profile.username}
            </h1>
            {gamesCount && gamesCount > 0 ? (
              <Badge variant="secondary" className="text-xs gap-1">
                <Gamepad2 className="h-3 w-3" />
                Dev
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm leading-relaxed mb-4 text-foreground/90">
            {profile.bio}
          </p>
        )}

        {/* Joined date */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-4">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Se unió en {joinedDate}</span>
        </div>

        <Separator className="mb-4" />

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{followersCount ?? 0}</span>
            <span className="text-muted-foreground">seguidores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{followingCount ?? 0}</span>
            <span className="text-muted-foreground">siguiendo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{postsCount ?? 0}</span>
            <span className="text-muted-foreground">posts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{gamesCount ?? 0}</span>
            <span className="text-muted-foreground">juegos</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pt-4">
        <Tabs defaultValue="posts">
          <TabsList variant="line" className="w-full border-b border-border rounded-none pb-0 h-auto bg-transparent gap-0">
            <TabsTrigger value="posts" className="flex-1 rounded-none pb-3 gap-2">
              <Newspaper className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="games" className="flex-1 rounded-none pb-3 gap-2">
              <Gamepad2 className="h-4 w-4" />
              Juegos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="pt-4 space-y-3">
            {posts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Newspaper className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium text-sm">
                    {isOwner ? 'Aún no has publicado nada' : 'Sin publicaciones aún'}
                  </p>
                  {isOwner && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ve al inicio para crear tu primer post
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as Parameters<typeof PostCard>[0]['post']}
                  currentUserId={currentUser?.id}
                  isAdmin={currentUserIsAdmin}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="games" className="pt-4">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                </div>
                {gamesCount === 0 ? (
                  <>
                    <p className="font-medium text-sm">
                      {isOwner ? 'Aún no has subido juegos' : 'Sin juegos aún'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isOwner ? 'Sube tu primer juego en la Fase 5' : 'Este usuario no tiene juegos aún'}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Los juegos se muestran en la Fase 5
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
