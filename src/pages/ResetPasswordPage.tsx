import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getResetPasswordSchema, type ResetPasswordFormData } from '@/features/auth/schemas'
import { authService } from '@/features/auth/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(getResetPasswordSchema(t)),
    defaultValues: {
      token: token || '',
    },
  })

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate({
      ...data,
      token: token || data.token,
    })
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Token</CardTitle>
            <CardDescription>
              The reset link is invalid or expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetPasswordMutation.isSuccess ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-sm text-center text-muted-foreground">
                  Password reset successfully! Redirecting to login...
                </p>
              </div>
            </div>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormField>
                <FormLabel htmlFor="newPassword">New Password</FormLabel>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password (min 8 characters)"
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <FormMessage>{errors.newPassword.message}</FormMessage>
                )}
              </FormField>

              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reset Password
              </Button>

              {resetPasswordMutation.isError && (
                <FormMessage>
                  {resetPasswordMutation.error instanceof Error
                    ? resetPasswordMutation.error.message
                    : 'Failed to reset password. Please try again.'}
                </FormMessage>
              )}

              <div className="mt-4 text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

