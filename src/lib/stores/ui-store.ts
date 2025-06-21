import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>
  theme: 'light' | 'dark' | 'system'
  loadingStates: Record<string, boolean>
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLoading: (key: string, loading: boolean) => void
  clearAllNotifications: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>((set, get) => ({
  // Estado inicial
  sidebarOpen: false,
  activeModal: null,
  notifications: [],
  theme: 'dark',
  loadingStates: {},

  // Acciones
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open: boolean) =>
    set({ sidebarOpen: open }),

  openModal: (modalId: string) =>
    set({ activeModal: modalId }),

  closeModal: () =>
    set({ activeModal: null }),

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))

    // Auto-remove notification after duration
    if (notification.duration !== undefined) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration)
    }
  },

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  setTheme: (theme: 'light' | 'dark' | 'system') =>
    set({ theme }),

  setLoading: (key: string, loading: boolean) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: loading },
    })),

  clearAllNotifications: () =>
    set({ notifications: [] }),
})) 