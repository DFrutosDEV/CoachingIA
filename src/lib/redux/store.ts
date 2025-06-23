import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authSlice from './slices/authSlice'
import sessionSlice from './slices/sessionSlice'
import uiSlice from './slices/uiSlice'

// Configuración de persistencia para auth (token y datos básicos)
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated'], // Persistir token y usuario
}

// Configuración de persistencia para session (datos no sensibles)
const sessionPersistConfig = {
  key: 'session',
  storage,
  whitelist: ['theme', 'language', 'isLoggedIn', 'userType', 'lastLoginDate'],
}

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice)
const persistedSessionReducer = persistReducer(sessionPersistConfig, sessionSlice)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer, // Persistir token y datos básicos
    session: persistedSessionReducer, // Persistir configuraciones
    ui: uiSlice, // No persistir - estado temporal de UI
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 