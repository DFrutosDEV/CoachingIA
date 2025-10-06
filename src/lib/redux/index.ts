export { store, persistor } from './store';
export type { RootState, AppDispatch } from './store';

export { useAppDispatch, useAppSelector } from './hooks';

export {
  login,
  logout,
  setLoading as setAuthLoading,
  updateUser,
  setError,
  clearError,
} from './slices/authSlice';

export {
  setSession,
  clearSession,
  setTheme as setSessionTheme,
  setLanguage,
  updateLastLogin,
} from './slices/sessionSlice';

export {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  setTheme as setUITheme,
  setLoading as setUILoading,
  clearAllNotifications,
} from './slices/uiSlice';

export type { User } from '@/types';
export type { Notification } from './slices/uiSlice';

export { AuthService } from '@/lib/services/auth-service';
