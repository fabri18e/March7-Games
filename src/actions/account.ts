'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type AccountState = { error?: string; success?: boolean }

export async function changePassword(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: 'No se pudo cambiar la contraseña. Intenta de nuevo.' }

  return { success: true }
}

export async function deleteAccount(): Promise<AccountState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { error: 'Configuración del servidor incompleta' }

  // Use admin client to fully delete the user from auth.users
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  await supabase.auth.signOut()

  // Deleting from auth.users cascades to profiles if FK is set up,
  // but we delete profile explicitly as a safety net
  await supabase.from('profiles').delete().eq('id', user.id)
  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) return { error: 'Error al eliminar la cuenta. Intenta de nuevo.' }

  redirect('/')
}
