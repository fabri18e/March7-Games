import type { Metadata } from 'next'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

export const metadata: Metadata = {
  title: 'Nueva contraseña — March7 Games',
}

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva contraseña</h2>
        <p className="text-muted-foreground mt-1.5">
          Elige una contraseña segura para tu cuenta
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  )
}
