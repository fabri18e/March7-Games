'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { resetPassword } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Enviando...' : 'Enviar instrucciones'}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(resetPassword, undefined)

  if (state?.success) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">¡Email enviado!</p>
          <p className="text-sm text-muted-foreground">{state.success}</p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Button>
        </Link>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
        />
      </div>

      <SubmitButton />

      <Link href="/login">
        <Button variant="ghost" className="w-full gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Button>
      </Link>
    </form>
  )
}
