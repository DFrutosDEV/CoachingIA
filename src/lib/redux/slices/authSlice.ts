import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Tipos para el estado de autenticación
export interface Role {
  _id: string
  name: string
  code: string
}

interface Profile {
  _id: string
  profilePicture: string
  bio: string
  indexDashboard: number[]
}

interface Enterprise {
  _id: string
  name: string
  logo: string
  address: string
  phone: string
  email: string
  website: string
  socialMedia: string[]
}

export interface User {
  _id: string
  role: Role
  profile: Profile
  enterprise: Enterprise | null
  name: string
  lastName: string
  email: string
  roles: string[]
  age?: number
} 

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  enterprises: Enterprise | null
  error: string | null
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  enterprises: null,
  error: null,
}

// Slice de autenticación
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Acciones de autenticación
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.token = action.payload.token
      state.isLoading = false
      state.error = null
    },
    
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      state.isLoading = false
      state.enterprises = null
      state.error = null
    },
    
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    // Acciones para Empresas
    setEnterprises: (state, action: PayloadAction<Enterprise | null>) => {
      state.enterprises = action.payload
    },
    
    addEnterprise: (state, action: PayloadAction<Enterprise>) => {
      if (!state.enterprises) {
        state.enterprises = action.payload
      }
    },
    
    updateEnterprise: (state, action: PayloadAction<{ id: string; updates: Partial<Enterprise> }>) => {
      if (state.enterprises) {
        state.enterprises = { ...state.enterprises, ...action.payload.updates }
      }
    },
    
    removeEnterprise: (state, action: PayloadAction<string>) => {
      state.enterprises = null
    },
    
    // Acciones generales
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  login,
  logout,
  setToken,
  setLoading,
  updateUser,
  setEnterprises,
  addEnterprise,
  updateEnterprise,
  removeEnterprise,
  setError,
  clearError,
} = authSlice.actions

export default authSlice.reducer 