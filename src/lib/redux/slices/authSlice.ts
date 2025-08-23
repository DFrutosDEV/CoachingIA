import { User, Enterprise } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  enterprises: Enterprise | null
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  enterprises: null,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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