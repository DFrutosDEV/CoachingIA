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