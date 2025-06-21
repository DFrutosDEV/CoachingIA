// Exportar todos los stores desde un punto central
export { useAuthStore } from './auth-store'
export { useUIStore } from './ui-store'
export { useDataStore } from './data-store'

// Re-exportar tipos para facilitar su uso
export type { User } from './auth-store'
export type { Client, Coach, Enterprise } from './data-store' 