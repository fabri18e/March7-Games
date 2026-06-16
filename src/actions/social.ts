'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SocialState = {
  error?: string
}

export async function followUser(followingId: string): Promise<SocialState> {
  if (!followingId) return { error: 'Invalid user ID' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must sign in' }
  if (user.id === followingId) return { error: 'You cannot follow yourself' }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: followingId })

  if (error) {
    // 23505 = unique_violation (already following) — treat as success
    if (error.code !== '23505') {
      return { error: 'Error following the user' }
    }
  }

  revalidatePath('/', 'layout')
  return {}
}

export async function unfollowUser(followingId: string): Promise<SocialState> {
  if (!followingId) return { error: 'Invalid user ID' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must sign in' }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) {
    return { error: 'Error unfollowing the user' }
  }

  revalidatePath('/', 'layout')
  return {}
}
