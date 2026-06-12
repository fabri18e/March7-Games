import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminClient } from '@/components/admin/AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  const cookieStore = await cookies()
  const previewMode = cookieStore.get('preview_mode')?.value ?? 'admin'

  // Fetch all data for admin
  const [
    { data: users },
    { data: posts },
    { count: totalLikes },
    { count: totalGames },
  ] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('posts').select('*, profiles!posts_user_id_fkey(username, display_name, avatar_url)').order('created_at', { ascending: false }),
    supabase.from('likes').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }),
  ])

  return (
    <AdminClient
      currentUserId={user.id}
      users={users ?? []}
      posts={posts ?? []}
      stats={{
        totalUsers: users?.length ?? 0,
        totalPosts: posts?.length ?? 0,
        totalLikes: totalLikes ?? 0,
        totalGames: totalGames ?? 0,
      }}
      currentPreviewMode={previewMode}
    />
  )
}
