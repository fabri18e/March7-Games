import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Recuperar contraseña — March7 Games',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Recupera tu contraseña</h2>
        <p className="text-muted-foreground mt-1.5">
          Te enviaremos las instrucciones a tu email
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
