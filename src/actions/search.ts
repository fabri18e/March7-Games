'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchProfiles(query: string) {
  if (!query.trim()) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(6)

  return data ?? []
}
