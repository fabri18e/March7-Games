'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AtSign, Mail } from 'lucide-react'
import { signUp } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Creando cuenta...' : 'Crear cuenta'}
    </Button>
  )
}

export function RegisterForm() {
  const [state, action] = useActionState(signUp, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fields, setFields] = useState({ username: '', email: '', password: '', confirmPassword: '' })

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }))

  // Email confirmation required — show check-email screen
  if (state?.success === 'confirm-email') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Revisa tu email</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Te enviamos un enlace de confirmación a{' '}
            <span className="font-medium text-foreground">{fields.email}</span>.
            Haz clic en él para activar tu cuenta.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          ¿Ya confirmaste?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <AtSign className="h-4 w-4" />
          </span>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="tu_username"
            required
            autoComplete="username"
            className="pl-9"
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            value={fields.username}
            onChange={set('username')}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          3-30 caracteres. Solo letras, números y guiones bajos.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
          value={fields.email}
          onChange={set('email')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="pr-10"
            minLength={8}
            value={fields.password}
            onChange={set('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Mínimo 8 caracteres, una mayúscula y un número.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="pr-10"
            value={fields.confirmPassword}
            onChange={set('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
