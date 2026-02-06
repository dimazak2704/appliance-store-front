import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getForgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas'
import { authService } from '@/features/auth/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(getForgotPasswordSchema(t)),
  })

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forgotPasswordMutation.isSuccess ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-sm text-center text-muted-foreground">
                  If an account with that email exists, we've sent you a password reset link.
                  Please check your email.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormField>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <FormMessage>{errors.email.message}</FormMessage>
                )}
              </FormField>

              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Reset Link
              </Button>

              {forgotPasswordMutation.isError && (
                <FormMessage>
                  {forgotPasswordMutation.error instanceof Error
                    ? forgotPasswordMutation.error.message
                    : 'Failed to send reset link. Please try again.'}
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

