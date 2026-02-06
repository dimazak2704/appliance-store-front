import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { getRegisterSchema, type RegisterFormData } from '../schemas'
import { authService } from '../authService'
import { handleApiError } from '@/lib/errorHandler'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { AlertWithDismiss } from '@/components/ui/alert'
import { Loader2, User, Mail, Lock, CreditCard, Sparkles } from 'lucide-react'
import { GooglePasswordModal } from './GooglePasswordModal'
import { useAuthStore } from '../store'

export function RegisterForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [showGooglePasswordModal, setShowGooglePasswordModal] = useState(false)
  const [googleToken, setGoogleToken] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      // Show success message and redirect to login or show confirmation message
      alert('Registration successful! Please check your email to confirm your account.')
      navigate('/login')
    },
    onError: (error) => {
      handleApiError(error, {
        setError,
        setGlobalError: (message) => {
          setGlobalError(message)
        },
      })
    },
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(getRegisterSchema(t)),
  })

  const onSubmit = (data: RegisterFormData) => {
    setGlobalError(null)
    registerMutation.mutate(data)
  }

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      // credentialResponse.credential is the ID token (JWT)
      // Store the Google ID token and show password modal
      setGoogleToken(credentialResponse.credential)
      setShowGooglePasswordModal(true)
    }
  }

  const handleGoogleError = () => {
    console.error('Google login failed')
  }

  return (
    <>
      {showGooglePasswordModal && googleToken && (
        <GooglePasswordModal
          googleToken={googleToken}
          onClose={() => {
            setShowGooglePasswordModal(false)
            setGoogleToken(null)
          }}
          onSuccess={(data) => {
            setAuth(data.token, data.role, data.name)
            navigate('/')
          }}
        />
      )}
      <Card className="w-full max-w-lg shadow-xl border-2 hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="pb-5 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">{t('auth.createAccount')}</CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground">{t('auth.enterInformation')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {t('auth.name')}
                </FormLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.enterName')}
                  className="h-10"
                  {...register('name')}
                />
                {errors.name && (
                  <FormMessage className="text-xs">{errors.name.message}</FormMessage>
                )}
              </FormField>

              <FormField>
                <FormLabel htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {t('auth.email')}
                </FormLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.enterEmail')}
                  className="h-10"
                  {...register('email')}
                />
                {errors.email && (
                  <FormMessage className="text-xs">{errors.email.message}</FormMessage>
                )}
              </FormField>
            </div>

            <FormField>
              <FormLabel htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                {t('auth.password')}
              </FormLabel>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.enterPasswordMin')}
                className="h-10"
                {...register('password')}
              />
              {errors.password && (
                <FormMessage className="text-xs">{errors.password.message}</FormMessage>
              )}
            </FormField>

            <FormField>
              <FormLabel htmlFor="card" className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {t('auth.cardNumber')}
              </FormLabel>
              <Input
                id="card"
                type="text"
                placeholder={t('auth.enterCardNumber')}
                className="h-10"
                {...register('card')}
              />
              {errors.card && (
                <FormMessage className="text-xs">{errors.card.message}</FormMessage>
              )}
            </FormField>

            {globalError && (
              <AlertWithDismiss
                variant="destructive"
                onDismiss={() => setGlobalError(null)}
                className="text-sm"
              >
                {globalError}
              </AlertWithDismiss>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-base mt-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('auth.register')}
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground text-[10px] font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="w-full flex justify-center [&>div]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            </div>

            <div className="pt-2 text-center text-xs">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t('auth.signIn')}
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}

