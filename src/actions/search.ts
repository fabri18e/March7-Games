'use server'

import Fuse from 'fuse.js'
import { createClient } from '@/lib/supabase/server'

const MAX_PROFILES = 1000

export async function searchProfiles(query: string, limit = 6) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .limit(MAX_PROFILES)

  if (!data || data.length === 0) return []

  const fuse = new Fuse(data, {
    keys: ['username', 'display_name'],
    threshold: 0.35,
    ignoreLocation: true,
  })

  return fuse.search(trimmed).slice(0, limit).map((r) => r.item)
}
