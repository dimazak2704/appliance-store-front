import React from 'react'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-lg">
        <RegisterForm />
      </div>
    </div>
  )
}

