import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset password — March7 Games',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reset your password</h2>
        <p className="text-muted-foreground mt-1.5">
          We&apos;ll send the instructions to your email
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
