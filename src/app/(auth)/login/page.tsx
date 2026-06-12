import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión — March7 Games',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h2>
        <p className="text-muted-foreground mt-1.5">
          Inicia sesión para continuar jugando
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
