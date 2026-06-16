'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
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
  if (error) return { error: 'Could not change the password. Please try again.' }

  return { success: true }
}

export async function deleteAccount(): Promise<AccountState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { error: 'Incomplete server configuration' }

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

  if (error) return { error: 'Error deleting the account. Please try again.' }

  redirect('/')
}
