import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create account — March7 Games',
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="text-muted-foreground mt-1.5">
          Join the community of gamers
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
