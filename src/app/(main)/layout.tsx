import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/layout/TopNav'
import { LeftSidebar } from '@/components/layout/LeftSidebar'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  // Preview mode: admin can simulate guest or normal user view
  const cookieStore = await cookies()
  const previewMode = profile?.is_admin ? (cookieStore.get('preview_mode')?.value ?? 'admin') : 'admin'

  const effectiveUser = previewMode === 'guest' ? null : user
  const effectiveProfile = previewMode === 'guest' ? null : previewMode === 'user' ? { ...profile, is_admin: false } : profile

  return (
    <div className="min-h-screen bg-background">
      <TopNav user={effectiveUser} profile={effectiveProfile} />
      <div className="container mx-auto max-w-6xl flex">
        <LeftSidebar user={effectiveUser} profile={effectiveProfile} isAdmin={profile?.is_admin ?? false} previewMode={previewMode} />
        <main className="flex-1 min-w-0 px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
