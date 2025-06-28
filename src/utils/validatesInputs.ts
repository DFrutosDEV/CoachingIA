export const validateDates = (clientForm: any, showError: (message: string) => void) => {
  const selectedDate = new Date(clientForm.startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (selectedDate < today) {
    showError('La fecha de inicio no puede ser anterior a hoy')
    return false
  }

  // Validar que no sea fin de semana (opcional)
  const dayOfWeek = selectedDate.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    showError('Por favor selecciona un día de la semana (lunes a viernes)')
    return false
  }

  // Validar horario de trabajo (ejemplo: 8:00 - 18:00)
  const [hours, minutes] = clientForm.startTime.split(':').map(Number)
  const selectedTime = hours * 60 + minutes
  const startWorkTime = 8 * 60 // 8:00
  const endWorkTime = 18 * 60 // 18:00

  if (selectedTime < startWorkTime || selectedTime > endWorkTime) {
    showError('Por favor selecciona un horario entre 8:00 y 18:00')
    return false
  }

  return true
}

// Función para obtener el locale del navegador
export const getBrowserLocale = (): string => {
  if (typeof window === 'undefined') {
    return 'es-ES' // Fallback para SSR
  }
  
  // Obtener el locale del navegador
  const browserLocale = navigator.language || navigator.languages?.[0] || 'es-ES'
  
  // Mapear algunos locales comunes a formatos más específicos
  const localeMap: { [key: string]: string } = {
    'es': 'es-ES',
    'es-AR': 'es-ES', // Argentina
    'es-MX': 'es-ES', // México
    'es-CL': 'es-ES', // Chile
    'es-CO': 'es-ES', // Colombia
    'es-PE': 'es-ES', // Perú
    'en': 'en-US',
    'en-US': 'en-US',
    'en-GB': 'en-GB',
    'pt': 'pt-BR',
    'pt-BR': 'pt-BR',
    'pt-PT': 'pt-PT',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT'
  }
  
  return localeMap[browserLocale] || browserLocale
}

// Función para formatear fechas con el locale del navegador
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const locale = getBrowserLocale()
  return date.toLocaleDateString(locale, options)
}

// Función para formatear horas con el locale del navegador
export const formatTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const locale = getBrowserLocale()
  return date.toLocaleTimeString(locale, options)
}

// Función para formatear fecha y hora con el locale del navegador
export const formatDateTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const locale = getBrowserLocale()
  return date.toLocaleString(locale, options)
}