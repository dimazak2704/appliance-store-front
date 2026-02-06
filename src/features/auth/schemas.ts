import { z } from 'zod'
import { TFunction } from 'i18next'

export const getRegisterSchema = (t: TFunction) => z.object({
  name: z.string().min(1, t('validation.name.required')),
  email: z.string().email(t('validation.email.invalid')),
  password: z.string().min(8, t('validation.password.min')),
  card: z.string().optional(),
})

export const getLoginSchema = (t: TFunction) => z.object({
  email: z.string().email(t('validation.email.invalid')),
  password: z.string().min(1, t('validation.password.required')),
})

export const getForgotPasswordSchema = (t: TFunction) => z.object({
  email: z.string().email(t('validation.email.invalid')),
})

export const getResetPasswordSchema = (t: TFunction) => z.object({
  token: z.string().min(1, t('validation.token.required')),
  newPassword: z.string().min(8, t('validation.password.min')),
})

export const getGoogleRegisterSchema = (t: TFunction) => z.object({
  token: z.string().min(1, t('validation.token.required')),
  password: z.string().min(8, t('validation.password.min')),
  card: z.string().optional(),
})

export type RegisterFormData = z.infer<ReturnType<typeof getRegisterSchema>>
export type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>
export type ForgotPasswordFormData = z.infer<ReturnType<typeof getForgotPasswordSchema>>
export type ResetPasswordFormData = z.infer<ReturnType<typeof getResetPasswordSchema>>
export type GoogleRegisterFormData = z.infer<ReturnType<typeof getGoogleRegisterSchema>>

