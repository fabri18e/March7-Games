import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta — March7 Games',
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Crea tu cuenta</h2>
        <p className="text-muted-foreground mt-1.5">
          Únete a la comunidad de gamers
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
