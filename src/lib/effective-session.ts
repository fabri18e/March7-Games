import { cookies } from 'next/headers'
import { createClient } from './supabase/server'

export async function getEffectiveSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const cookieStore = await cookies()
  const previewMode = profile?.is_admin
    ? (cookieStore.get('preview_mode')?.value ?? 'admin')
    : 'admin'

  const effectiveUser = previewMode === 'guest' ? null : user
  const effectiveProfile =
    previewMode === 'guest' ? null
    : previewMode === 'user' ? { ...profile, is_admin: false }
    : profile

  return {
    user: effectiveUser,
    profile: effectiveProfile,
    isAdmin: effectiveProfile?.is_admin ?? false,
    supabase,
  }
}
