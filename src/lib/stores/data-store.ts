import { create } from 'zustand'
import { User } from './auth-store'

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

interface DataState {
  clients: Client[]
  coaches: Coach[]
  enterprises: Enterprise[]
  isLoading: boolean
  error: string | null
}

interface DataActions {
  setClients: (clients: Client[]) => void
  addClient: (client: Client) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  removeClient: (id: string) => void
  
  setCoaches: (coaches: Coach[]) => void
  addCoach: (coach: Coach) => void
  updateCoach: (id: string, updates: Partial<Coach>) => void
  removeCoach: (id: string) => void
  
  setEnterprises: (enterprises: Enterprise[]) => void
  addEnterprise: (enterprise: Enterprise) => void
  updateEnterprise: (id: string, updates: Partial<Enterprise>) => void
  removeEnterprise: (id: string) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

type DataStore = DataState & DataActions

export const useDataStore = create<DataStore>((set, get) => ({
  // Estado inicial
  clients: [],
  coaches: [],
  enterprises: [],
  isLoading: false,
  error: null,

  // Acciones para Clientes
  setClients: (clients: Client[]) =>
    set({ clients }),

  addClient: (client: Client) =>
    set((state) => ({
      clients: [...state.clients, client],
    })),

  updateClient: (id: string, updates: Partial<Client>) =>
    set((state) => ({
      clients: state.clients.map((client) =>
        client._id === id ? { ...client, ...updates } : client
      ),
    })),

  removeClient: (id: string) =>
    set((state) => ({
      clients: state.clients.filter((client) => client._id !== id),
    })),

  // Acciones para Coaches
  setCoaches: (coaches: Coach[]) =>
    set({ coaches }),

  addCoach: (coach: Coach) =>
    set((state) => ({
      coaches: [...state.coaches, coach],
    })),

  updateCoach: (id: string, updates: Partial<Coach>) =>
    set((state) => ({
      coaches: state.coaches.map((coach) =>
        coach._id === id ? { ...coach, ...updates } : coach
      ),
    })),

  removeCoach: (id: string) =>
    set((state) => ({
      coaches: state.coaches.filter((coach) => coach._id !== id),
    })),

  // Acciones para Empresas
  setEnterprises: (enterprises: Enterprise[]) =>
    set({ enterprises }),

  addEnterprise: (enterprise: Enterprise) =>
    set((state) => ({
      enterprises: [...state.enterprises, enterprise],
    })),

  updateEnterprise: (id: string, updates: Partial<Enterprise>) =>
    set((state) => ({
      enterprises: state.enterprises.map((enterprise) =>
        enterprise._id === id ? { ...enterprise, ...updates } : enterprise
      ),
    })),

  removeEnterprise: (id: string) =>
    set((state) => ({
      enterprises: state.enterprises.filter((enterprise) => enterprise._id !== id),
    })),

  // Acciones generales
  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  clearError: () =>
    set({ error: null }),
})) 