import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  role: string | null
  userName: string | null
  isAuthenticated: boolean
  setAuth: (token: string, role: string, userName?: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userName: null,
      isAuthenticated: false,
      setAuth: (token: string, role: string, userName?: string) => {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_role', role)
        if (userName) {
          localStorage.setItem('user_name', userName)
          set({ token, role, userName, isAuthenticated: true })
        } else {
          set({ token, role, userName: null, isAuthenticated: true })
        }
      },
      clearAuth: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_role')
        localStorage.removeItem('user_name')
        set({ token: null, role: null, userName: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        userName: state.userName,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

