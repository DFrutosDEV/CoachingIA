import { AuthService } from './auth-service'

export interface SessionEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  client: string
  coach: string
  link: string
  time: string
  objectiveTitle: string
}

export interface CalendarResponse {
  success: boolean
  events: SessionEvent[]
  error?: string
}

export class CalendarService {
  private static baseUrl = '/api/calendar'

  // Obtener sesiones del calendario
  static async getSessions(params?: {
    startDate?: string
    endDate?: string
  }): Promise<CalendarResponse> {
    try {
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        throw new Error('Usuario no autenticado')
      }

      // Determinar el tipo de usuario
      const userRoles = currentUser.roles
      const userType = userRoles.includes('admin') ? 'admin' : 
                      userRoles.includes('coach') ? 'coach' : 
                      userRoles.includes('client') ? 'client' : 'enterprise'

      // Obtener la zona horaria del navegador
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      // Construir la URL con parámetros
      const searchParams = new URLSearchParams({
        userId: currentUser._id,
        userType: userType,
        timezone: timezone // Enviar zona horaria al backend
      })

      if (params?.startDate) {
        searchParams.append('startDate', params.startDate)
      }
      if (params?.endDate) {
        searchParams.append('endDate', params.endDate)
      }

      const response = await fetch(`${this.baseUrl}?${searchParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar las sesiones')
      }

      const data = await response.json()
      
      if (data.success) {
        // Convertir las fechas de strings ISO a objetos Date
        const processedEvents = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }))

        return {
          success: true,
          events: processedEvents
        }
      } else {
        throw new Error(data.error || 'Error al cargar las sesiones')
      }

    } catch (error) {
      console.error('Error en CalendarService.getSessions:', error)
      return {
        success: false,
        events: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Crear una nueva sesión (para futuras implementaciones)
  static async createSession(sessionData: {
    clientId: string
    objectiveId: string
    date: Date
    time: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        throw new Error('Usuario no autenticado')
      }

      // Combinar fecha y hora
      const sessionDate = new Date(sessionData.date);
      const [hours, minutes] = sessionData.time.split(':');
      sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch('/api/meets', {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          clientId: sessionData.clientId,
          coachId: currentUser._id, // Asumiendo que el coach actual crea la sesión
          objectiveId: sessionData.objectiveId,
          meets: [{
            date: sessionDate
          }]
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear la sesión')
      }

      const data = await response.json()
      
      if (data.success) {
        return { success: true }
      } else {
        throw new Error(data.error || 'Error al crear la sesión')
      }

    } catch (error) {
      console.error('Error en CalendarService.createSession:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Cancelar una sesión (para futuras implementaciones)
  static async cancelSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/meets/${sessionId}`, {
        method: 'PATCH',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          isCancelled: true
        })
      })

      if (!response.ok) {
        throw new Error('Error al cancelar la sesión')
      }

      const data = await response.json()
      
      if (data.success) {
        return { success: true }
      } else {
        throw new Error(data.error || 'Error al cancelar la sesión')
      }

    } catch (error) {
      console.error('Error en CalendarService.cancelSession:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
} 