import { apiClient } from '@/lib/axios'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GoogleRegisterRequest,
  GoogleLoginRequest,
} from './types'

export const authService = {
  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post('/register', data)
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', data)
    return response.data
  },

  confirmEmail: async (token: string): Promise<void> => {
    await apiClient.post(`/confirm-email?token=${token}`)
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(`/forgot-password?email=${data.email}`)
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/reset-password', data)
  },

  googleRegister: async (data: GoogleRegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/google-register', data)
    return response.data
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/google-login', data)
    return response.data
  },
}

