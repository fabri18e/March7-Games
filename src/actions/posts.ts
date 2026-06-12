'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { postSchema } from '@/lib/validations'

export type PostActionState = {
  error?: string
  success?: boolean
}

export async function createPost(
  prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Debes iniciar sesión para publicar' }

  const result = postSchema.safeParse({ content: formData.get('content') })
  if (!result.success) return { error: result.error.errors[0].message }

  const { error } = await supabase
    .from('posts')
    .insert({ user_id: user.id, content: result.data.content })

  if (error) return { error: 'Error al publicar. Intenta de nuevo.' }

  revalidatePath('/')
  return { success: true }
}

export async function getComments(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey(username, display_name, avatar_url), comment_likes(count)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  let userLikedSet = new Set<string>()
  if (user && data && data.length > 0) {
    const { data: userLikes } = await supabase
      .from('comment_likes').select('comment_id').eq('user_id', user.id)
      .in('comment_id', data.map(c => c.id))
    userLikedSet = new Set(userLikes?.map(l => l.comment_id) ?? [])
  }

  // compute reply_count per comment from the flat list
  const replyCountMap = new Map<string, number>()
  data?.forEach(c => { if (c.parent_id) replyCountMap.set(c.parent_id, (replyCountMap.get(c.parent_id) ?? 0) + 1) })

  return (data ?? []).map(c => ({
    ...c,
    like_count: (c.comment_likes as Array<{ count: number }>)?.[0]?.count ?? 0,
    user_has_liked: userLikedSet.has(c.id),
    reply_count: replyCountMap.get(c.id) ?? 0,
  }))
}

export async function getCommentById(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey(*), comment_likes(count)')
    .eq('id', commentId).single()
  if (!data) return null

  const [likeRes, replyRes] = await Promise.all([
    user ? supabase.from('comment_likes').select('comment_id').eq('user_id', user.id).eq('comment_id', commentId).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('parent_id', commentId),
  ])

  return {
    ...data,
    like_count: (data.comment_likes as Array<{ count: number }>)?.[0]?.count ?? 0,
    user_has_liked: !!likeRes.data,
    reply_count: replyRes.count ?? 0,
  }
}

export async function getCommentReplies(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey(username, display_name, avatar_url), comment_likes(count)')
    .eq('parent_id', commentId)
    .order('created_at', { ascending: true })

  if (!data || data.length === 0) return []

  let userLikedSet = new Set<string>()
  if (user) {
    const { data: likes } = await supabase.from('comment_likes').select('comment_id').eq('user_id', user.id)
      .in('comment_id', data.map(c => c.id))
    userLikedSet = new Set(likes?.map(l => l.comment_id) ?? [])
  }

  // reply counts for each reply
  const { data: grandchildren } = await supabase.from('comments').select('parent_id').in('parent_id', data.map(c => c.id))
  const replyCountMap = new Map<string, number>()
  grandchildren?.forEach(g => replyCountMap.set(g.parent_id, (replyCountMap.get(g.parent_id) ?? 0) + 1))

  return data.map(c => ({
    ...c,
    like_count: (c.comment_likes as Array<{ count: number }>)?.[0]?.count ?? 0,
    user_has_liked: userLikedSet.has(c.id),
    reply_count: replyCountMap.get(c.id) ?? 0,
  }))
}

export async function toggleCommentLike(commentId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .maybeSingle()

  if (existing) {
    await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', commentId)
  } else {
    await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId })
  }
}

export async function addComment(postId: string, content: string, parentId?: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const trimmed = content.trim().slice(0, 400)
  if (!trimmed) return
  await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    content: trimmed,
    ...(parentId ? { parent_id: parentId } : {}),
  })
  revalidatePath('/', 'layout')
}

async function deleteCommentCascade(db: Awaited<ReturnType<typeof createClient>>, commentId: string): Promise<void> {
  const { data: children } = await db.from('comments').select('id').eq('parent_id', commentId)
  for (const child of children ?? []) {
    await deleteCommentCascade(db, child.id)
  }
  await db.from('comment_likes').delete().eq('comment_id', commentId)
  await db.from('comments').delete().eq('id', commentId)
}

export async function deleteComment(commentId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()

  const isAdmin = profile?.is_admin ?? false
  const { data: comment } = await supabase.from('comments').select('user_id').eq('id', commentId).single()
  if (!isAdmin && comment?.user_id !== user.id) return

  if (isAdmin) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await deleteCommentCascade(admin as unknown as Awaited<ReturnType<typeof createClient>>, commentId)
  } else {
    await deleteCommentCascade(supabase, commentId)
  }
  revalidatePath('/', 'layout')
}

export async function deletePost(postId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await admin.from('comment_likes').delete().eq('comment_id', postId)
    await admin.from('comments').delete().eq('post_id', postId)
    await admin.from('likes').delete().eq('post_id', postId)
    await admin.from('posts').delete().eq('id', postId)
  } else {
    await supabase.from('comment_likes').delete().eq('comment_id', postId)
    await supabase.from('comments').delete().eq('post_id', postId)
    await supabase.from('likes').delete().eq('post_id', postId)
    await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)
  }

  revalidatePath('/', 'layout')
}

export async function toggleLike(postId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle()

  if (existing) {
    await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId)
  } else {
    await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
  }

  revalidatePath('/')
}
