import { store } from '../redux/store'
import { logout } from '../redux/slices/authSlice'

// Cliente HTTP que incluye automáticamente el token
export class HttpClient {
  
  // Obtener headers con token
  private static getHeaders(): Record<string, string> {
    const state = store.getState()
    const token = state.auth.token
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  // Manejar respuestas y errores de autenticación
  private static async handleResponse(response: Response) {
    // Si es 401, hacer logout automático
    if (response.status === 401) {
      console.warn('🚨 Token expirado o inválido - Redirigiendo al login');
      store.dispatch(logout());
      
      // Redirigir al login (solo en el cliente)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return response;
  }

  // GET request con token
  static async get(url: string) {
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })
    return this.handleResponse(response);
  }

  // POST request con token
  static async post(url: string, data?: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse(response);
  }

  // PUT request con token
  static async put(url: string, data?: any) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse(response);
  }

  // DELETE request con token
  static async delete(url: string) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    })
    return this.handleResponse(response);
  }
} 