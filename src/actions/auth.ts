'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from '@/lib/validations'

export type AuthState = {
  error?: string
  success?: string
}

export async function signIn(
  _prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      return { error: 'Email o contraseña incorrectos' }
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Confirma tu email antes de iniciar sesión' }
    }
    return { error: 'Error al iniciar sesión. Intenta nuevamente.' }
  }

  redirect('/')
}

export async function signUp(
  _prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Check username availability
  const { data: existingUsername } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', parsed.data.username.toLowerCase())
    .maybeSingle()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username.toLowerCase() },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  // Block if username is taken by a DIFFERENT confirmed user
  // (if identities=[] it's the same unconfirmed user re-registering — handled below)
  if (existingUsername && data.user && existingUsername.id !== data.user.id) {
    return { error: 'Este username ya está en uso' }
  }
  if (existingUsername && !data.user) {
    return { error: 'Este username ya está en uso' }
  }

  if (error) {
    const msg = error.message.toLowerCase()
    if (
      msg.includes('already registered') ||
      msg.includes('already exists') ||
      msg.includes('email address is already') ||
      msg.includes('user already registered')
    ) {
      return { error: 'Este email ya está registrado' }
    }
    if (msg.includes('password')) {
      return { error: 'La contraseña no cumple los requisitos mínimos' }
    }
    if (msg.includes('rate limit') || msg.includes('too many')) {
      return { error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' }
    }
    return { error: `Error al crear la cuenta: ${error.message}` }
  }

  // Supabase returns identities=[] when email exists but is unconfirmed
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    const newUsername = parsed.data.username.toLowerCase()
    const userId = data.user.id

    // Update the username on the existing unconfirmed account using admin API
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      // Update metadata so the trigger creates the profile with the new username
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { username: newUsername },
      })
      // Update profile row if it already exists
      await admin.from('profiles').update({
        username: newUsername,
        updated_at: new Date().toISOString(),
      }).eq('id', userId)
    }

    await supabase.auth.resend({ type: 'signup', email: parsed.data.email }).catch(() => {})
    return { success: 'confirm-email' }
  }

  // Session exists → email confirmation disabled, user is logged in
  if (data.session) {
    redirect('/')
  }

  // No session → email confirmation required
  return { success: 'confirm-email' }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(
  _prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const raw = { email: formData.get('email') as string }

  const parsed = forgotPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/update-password`,
    }
  )

  if (error) {
    return { error: 'Error al enviar el email. Intenta nuevamente.' }
  }

  return { success: '¡Revisa tu email para restablecer tu contraseña!' }
}
