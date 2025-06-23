import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  notifications: Notification[]
  theme: 'light' | 'dark' | 'system'
  loadingStates: Record<string, boolean>
}

// Estado inicial
const initialState: UIState = {
  sidebarOpen: false,
  activeModal: null,
  notifications: [],
  theme: 'dark',
  loadingStates: {},
}

// Slice de UI
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    
    closeModal: (state) => {
      state.activeModal = null
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newNotification = { ...action.payload, id }
      state.notifications.push(newNotification)
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.loading
    },
    
    clearAllNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  setTheme,
  setLoading,
  clearAllNotifications,
} = uiSlice.actions

export type { Notification }
export default uiSlice.reducer 