import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getGoogleRegisterSchema, type GoogleRegisterFormData } from '../schemas'
import { authService } from '../authService'
import { handleApiError } from '@/lib/errorHandler'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { AlertWithDismiss } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import type { LoginResponse } from '../types'

interface GooglePasswordModalProps {
  googleToken: string
  onClose: () => void
  onSuccess: (data: LoginResponse) => void
}

export function GooglePasswordModal({ googleToken, onClose, onSuccess }: GooglePasswordModalProps) {
  const { t } = useTranslation()

  const [globalError, setGlobalError] = useState<string | null>(null)

  const googleRegisterMutation = useMutation({
    mutationFn: authService.googleRegister,
    onSuccess: (data) => {
      onSuccess(data)
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
  } = useForm<Omit<GoogleRegisterFormData, 'token'>>({
    resolver: zodResolver(getGoogleRegisterSchema(t).omit({ token: true })),
  })

  const onSubmit = (data: Omit<GoogleRegisterFormData, 'token'>) => {
    setGlobalError(null)
    googleRegisterMutation.mutate({
      token: googleToken,
      password: data.password,
      card: data.card || undefined,
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{t('auth.setPassword')}</DialogTitle>
          <DialogDescription>
            {t('auth.setPasswordDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField>
            <FormLabel htmlFor="password">{t('auth.password')}</FormLabel>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.enterPasswordMin')}
              {...register('password')}
            />
            {errors.password && (
              <FormMessage>{errors.password.message}</FormMessage>
            )}
          </FormField>

          <FormField>
            <FormLabel htmlFor="card">{t('auth.cardNumber')}</FormLabel>
            <Input
              id="card"
              type="text"
              placeholder={t('auth.enterCardNumber')}

              {...register('card')}
            />
            {errors.card && (
              <FormMessage>{errors.card.message}</FormMessage>
            )}
          </FormField>

          {globalError && (
            <AlertWithDismiss
              variant="destructive"
              onDismiss={() => setGlobalError(null)}
            >
              {globalError}
            </AlertWithDismiss>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={googleRegisterMutation.isPending}
            >
              {googleRegisterMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('buttons.completeRegistration')}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

