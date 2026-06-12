'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SocialState = {
  error?: string
}

export async function followUser(followingId: string): Promise<SocialState> {
  if (!followingId) return { error: 'ID de usuario inválido' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Debes iniciar sesión' }
  if (user.id === followingId) return { error: 'No puedes seguirte a ti mismo' }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: followingId })

  if (error) {
    // 23505 = unique_violation (already following) — treat as success
    if (error.code !== '23505') {
      return { error: 'Error al seguir al usuario' }
    }
  }

  revalidatePath('/', 'layout')
  return {}
}

export async function unfollowUser(followingId: string): Promise<SocialState> {
  if (!followingId) return { error: 'ID de usuario inválido' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Debes iniciar sesión' }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) {
    return { error: 'Error al dejar de seguir al usuario' }
  }

  revalidatePath('/', 'layout')
  return {}
}
