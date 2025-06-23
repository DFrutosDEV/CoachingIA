import { store } from '../redux/store'

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

  // GET request con token
  static async get(url: string) {
    return fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })
  }

  // POST request con token
  static async post(url: string, data?: any) {
    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request con token
  static async put(url: string, data?: any) {
    return fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request con token
  static async delete(url: string) {
    return fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    })
  }
} 