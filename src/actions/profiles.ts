'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validations'

export type ProfileState = {
  error?: string
  success?: boolean
  username?: string
}

export async function updateProfile(
  _prevState: ProfileState | undefined,
  formData: FormData
): Promise<ProfileState> {
  const raw = {
    username: formData.get('username') as string,
    display_name: (formData.get('display_name') as string) || undefined,
    bio: (formData.get('bio') as string) || undefined,
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const newUsername = parsed.data.username.toLowerCase()

  // Check the new username isn't taken by someone else
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', newUsername)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return { error: 'Este username ya está en uso' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username: newUsername,
      display_name: parsed.data.display_name || null,
      bio: parsed.data.bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Error al actualizar el perfil. Intenta nuevamente.' }
  }

  revalidatePath('/', 'layout')
  return { success: true, username: newUsername }
}

export async function uploadAvatar(formData: FormData): Promise<ProfileState> {
  const file = formData.get('avatar') as File | null

  if (!file || file.size === 0) {
    return { error: 'Selecciona una imagen' }
  }

  // Security: validate MIME type (don't trust extension)
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Solo se permiten imágenes JPG, PNG o WEBP' }
  }

  // Security: max 2MB
  const MAX_SIZE = 2 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return { error: 'La imagen no puede superar los 2MB' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Path uses user ID to prevent enumeration and enable upsert
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
  const storagePath = `${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(storagePath, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { error: 'Error al subir la imagen. Intenta nuevamente.' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(storagePath)

  // Cache-bust so the browser picks up the new image
  const avatarUrl = `${publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    return { error: 'Error al guardar el avatar' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
