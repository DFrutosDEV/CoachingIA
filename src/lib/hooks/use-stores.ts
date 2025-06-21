import { useAuthStore, useUIStore, useDataStore } from '../stores'

// Hook para obtener el estado completo de la aplicación
export const useAppState = () => {
  const auth = useAuthStore()
  const ui = useUIStore()
  const data = useDataStore()

  return {
    auth,
    ui,
    data,
  }
}

// Hook para verificar si el usuario tiene permisos específicos
export const usePermissions = () => {
  const { user } = useAuthStore()

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role: 'admin' | 'client' | 'coach' | 'enterprise') => 
    user?.role?.includes(role) || false

  const isAdmin = hasRole('admin')
  const isCoach = hasRole('coach')
  const isClient = hasRole('client')
  const isEnterprise = hasRole('enterprise')

  const canManageUsers = isAdmin || isEnterprise
  const canManageCoaches = isAdmin || isEnterprise
  const canViewAnalytics = isAdmin || isEnterprise || isCoach
  const canManageClients = isAdmin || isCoach || isEnterprise

  return {
    isAdmin,
    isCoach,
    isClient,
    isEnterprise,
    canManageUsers,
    canManageCoaches,
    canViewAnalytics,
    canManageClients,
    hasRole, // Función helper para verificar roles específicos
  }
}

// Hook para manejar notificaciones con el store de UI
export const useNotifications = () => {
  const { addNotification, removeNotification, notifications, clearAllNotifications } = useUIStore()

  const showSuccess = (message: string, duration = 3000) => {
    addNotification({ type: 'success', message, duration })
  }

  const showError = (message: string, duration = 5000) => {
    addNotification({ type: 'error', message, duration })
  }

  const showWarning = (message: string, duration = 4000) => {
    addNotification({ type: 'warning', message, duration })
  }

  const showInfo = (message: string, duration = 3000) => {
    addNotification({ type: 'info', message, duration })
  }

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
  }
}

// Hook para manejar estados de carga
export const useLoading = () => {
  const { loadingStates, setLoading } = useUIStore()

  const isLoading = (key: string) => loadingStates[key] || false

  const startLoading = (key: string) => setLoading(key, true)
  const stopLoading = (key: string) => setLoading(key, false)

  const withLoading = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
    startLoading(key)
    try {
      const result = await fn()
      return result
    } finally {
      stopLoading(key)
    }
  }

  return {
    loadingStates,
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
} 