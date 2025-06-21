import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  _id: string
  email: string
  name: string
  lastName: string
  roles: ('admin' | 'client' | 'coach' | 'enterprise')[]
  profile?: {
    avatar?: string
    phone?: string
    address?: string
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

interface AuthActions {
  login: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      // Acciones
      login: (user: User, token: string) =>
        set({
          user,
          isAuthenticated: true,
          token,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          isLoading: false,
        }),

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
) 