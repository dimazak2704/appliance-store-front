import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuthStore } from '../store'
import { getLoginSchema, type LoginFormData } from '../schemas'
import { authService } from '../authService'
import { handleApiError } from '@/lib/errorHandler'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormLabel, FormMessage, FormItem, FormControl } from '@/components/ui/form'
import { AlertWithDismiss } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.token, data.role, data.name)
      navigate('/')
    },
    onError: (error) => {
      handleApiError(error, {
        setError: (field, error) => form.setError(field as any, error),
        setGlobalError: (message) => {
          setGlobalError(message)
        },
      })
    },
  })

  const googleLoginMutation = useMutation({
    mutationFn: authService.googleLogin,
    onSuccess: (data) => {
      setAuth(data.token, data.role, data.name)
      navigate('/')
    },
    onError: (error) => {
      handleApiError(error, {
        setGlobalError: (message) => {
          setGlobalError(message)
        },
      })
    },
  })

  const form = useForm<LoginFormData>({
    resolver: zodResolver(getLoginSchema(t)),
  })

  const onSubmit = (data: LoginFormData) => {
    setGlobalError(null)
    loginMutation.mutate(data)
  }

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      // credentialResponse.credential is the ID token (JWT)
      googleLoginMutation.mutate({ token: credentialResponse.credential })
    }
  }

  const handleGoogleError = () => {
    console.error('Google login failed')
  }

  return (
    <Card className="w-full max-w-[350px] shadow-lg border">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">{t('auth.login')}</CardTitle>
        <CardDescription className="text-sm">
          {t('auth.enterCredentials')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('auth.enterEmail')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.password')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('auth.enterPassword')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {globalError && (
              <AlertWithDismiss
                variant="destructive"
                onDismiss={() => setGlobalError(null)}
              >
                {globalError}
              </AlertWithDismiss>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('auth.login')}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {googleLoginMutation.isPending ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('buttons.loading')}
              </Button>
            ) : (
              <div className="w-full flex justify-center [&>div]:w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>
            )}

            <div className="text-center text-sm">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                {t('auth.signUp')}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

