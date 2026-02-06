export interface LoginResponse {
  token: string
  role: string
  name?: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  card?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface GoogleRegisterRequest {
  token: string
  password: string
  card?: string
}

export interface GoogleLoginRequest {
  token: string
}

