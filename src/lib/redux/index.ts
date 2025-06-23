// Store principal
export { store, persistor } from './store'
export type { RootState, AppDispatch } from './store'

// Hooks tipados
export { useAppDispatch, useAppSelector } from './hooks'

// Slices y acciones con alias para evitar conflictos
export {
  // Auth slice
  login,
  logout,
  setLoading as setAuthLoading,
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
  clearError
} from './slices/authSlice'

export {
  // Session slice
  setSession,
  clearSession,
  setTheme as setSessionTheme,
  setLanguage,
  updateLastLogin
} from './slices/sessionSlice'

export {
  // UI slice
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  setTheme as setUITheme,
  setLoading as setUILoading,
  clearAllNotifications
} from './slices/uiSlice'

// Tipos exportados
export type { User, Client, Coach, Enterprise } from './slices/authSlice'
export type { Notification } from './slices/uiSlice'

// Servicios
export { AuthService } from '../services/auth-service'
export { HttpClient } from '../utils/http-client' 