'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) throw new Error('Sin permisos')
  return { supabase, user }
}

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function adminDeletePost(postId: string) {
  await requireAdmin()
  const admin = getAdmin()
  await admin.from('likes').delete().eq('post_id', postId)
  await admin.from('posts').delete().eq('id', postId)
  revalidatePath('/', 'layout')
}

export async function adminDeleteUser(userId: string) {
  await requireAdmin()
  const admin = getAdmin()
  await admin.from('profiles').delete().eq('id', userId)
  await admin.auth.admin.deleteUser(userId)
  revalidatePath('/', 'layout')
}

export async function adminToggleAdmin(userId: string, current: boolean) {
  await requireAdmin()
  const admin = getAdmin()
  await admin.from('profiles').update({ is_admin: !current }).eq('id', userId)
  revalidatePath('/', 'layout')
}

export async function setPreviewMode(mode: 'admin' | 'user' | 'guest') {
  const cookieStore = await cookies()
  if (mode === 'admin') {
    cookieStore.delete('preview_mode')
  } else {
    cookieStore.set('preview_mode', mode, { path: '/', maxAge: 60 * 60 * 24 })
  }
}
