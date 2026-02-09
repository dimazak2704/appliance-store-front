import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  role: string | null
  name: string | null
  isAuthenticated: boolean
  setAuth: (token: string, role: string, name?: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      name: null,
      isAuthenticated: false,
      setAuth: (token: string, role: string, name?: string) => {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_role', role)
        if (name) {
          localStorage.setItem('user_name', name)
          set({ token, role, name, isAuthenticated: true })
        } else {
          set({ token, role, name: null, isAuthenticated: true })
        }
      },
      clearAuth: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_role')
        localStorage.removeItem('user_name')
        set({ token: null, role: null, name: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        name: state.name,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

