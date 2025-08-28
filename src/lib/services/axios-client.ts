import axios from 'axios'
import { store } from '../redux/store'
import { logout } from '../redux/slices/authSlice'

// Crear instancia de Axios
export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
})

// Interceptor de requests - Agregar token automáticamente
axiosClient.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('❌ Axios Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor de responses - Manejar errores 401
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // No hacer logout automático en el endpoint de login
    if (error.response?.status === 401 && !error.config?.url?.includes('/api/loggin')) {
      store.dispatch(logout())
    }
    
    return Promise.reject(error)
  }
)
