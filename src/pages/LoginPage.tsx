import React from 'react'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <LoginForm />
    </div>
  )
}

