import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Tipos para el estado de autenticación
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

export interface Client extends User {
  coach?: string
  goals?: Array<{
    id: string
    title: string
    description: string
    status: 'pending' | 'in-progress' | 'completed'
    dueDate?: Date
  }>
  progress?: Array<{
    id: string
    date: Date
    weight?: number
    measurements?: Record<string, number>
    notes?: string
  }>
}

export interface Coach extends User {
  clients?: string[]
  specialties?: string[]
  availability?: Array<{
    day: string
    startTime: string
    endTime: string
  }>
}

export interface Enterprise extends User {
  employees?: string[]
  coaches?: string[]
  subscription?: {
    plan: 'basic' | 'premium' | 'enterprise'
    startDate: Date
    endDate: Date
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  clients: Client[]
  coaches: Coach[]
  enterprises: Enterprise[]
  error: string | null
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  clients: [],
  coaches: [],
  enterprises: [],
  error: null,
}

// Thunk removido - ya no necesario con persistencia en localStorage

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
      state.clients = []
      state.coaches = []
      state.enterprises = []
      state.error = null
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    // Acciones para Clientes
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload
    },
    
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.push(action.payload)
    },
    
    updateClient: (state, action: PayloadAction<{ id: string; updates: Partial<Client> }>) => {
      const index = state.clients.findIndex(client => client._id === action.payload.id)
      if (index !== -1) {
        state.clients[index] = { ...state.clients[index], ...action.payload.updates }
      }
    },
    
    removeClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(client => client._id !== action.payload)
    },
    
    // Acciones para Coaches
    setCoaches: (state, action: PayloadAction<Coach[]>) => {
      state.coaches = action.payload
    },
    
    addCoach: (state, action: PayloadAction<Coach>) => {
      state.coaches.push(action.payload)
    },
    
    updateCoach: (state, action: PayloadAction<{ id: string; updates: Partial<Coach> }>) => {
      const index = state.coaches.findIndex(coach => coach._id === action.payload.id)
      if (index !== -1) {
        state.coaches[index] = { ...state.coaches[index], ...action.payload.updates }
      }
    },
    
    removeCoach: (state, action: PayloadAction<string>) => {
      state.coaches = state.coaches.filter(coach => coach._id !== action.payload)
    },
    
    // Acciones para Empresas
    setEnterprises: (state, action: PayloadAction<Enterprise[]>) => {
      state.enterprises = action.payload
    },
    
    addEnterprise: (state, action: PayloadAction<Enterprise>) => {
      state.enterprises.push(action.payload)
    },
    
    updateEnterprise: (state, action: PayloadAction<{ id: string; updates: Partial<Enterprise> }>) => {
      const index = state.enterprises.findIndex(enterprise => enterprise._id === action.payload.id)
      if (index !== -1) {
        state.enterprises[index] = { ...state.enterprises[index], ...action.payload.updates }
      }
    },
    
    removeEnterprise: (state, action: PayloadAction<string>) => {
      state.enterprises = state.enterprises.filter(enterprise => enterprise._id !== action.payload)
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
  setLoading,
  updateUser,
  setClients,
  addClient,
  updateClient,
  removeClient,
  setCoaches,
  addCoach,
  updateCoach,
  removeCoach,
  setEnterprises,
  addEnterprise,
  updateEnterprise,
  removeEnterprise,
  setError,
  clearError,
} = authSlice.actions

export default authSlice.reducer 