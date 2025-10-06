/**
 * Genera un link de Jitsi Meet único para una sesión
 * @param date - Fecha de la sesión (Date object)
 * @param clientId - ID del cliente
 * @param coachId - ID del coach
 * @returns Link de Jitsi Meet
 */
export function generateJitsiLink(
  date: Date,
  clientId: string,
  coachId: string
): string {
  // Crear un ID único para la reunión usando la fecha completa
  const dateStr = date.toISOString().replace(/[-:T.]/g, '');
  const meetingId = `${dateStr}${clientId}${coachId}`;

  // Jitsi Meet usa el formato: https://meet.jit.si/[meeting-id]
  return `https://meet.jit.si/${meetingId}`;
}

/**
 * Genera un link de Jitsi Meet con un nombre personalizado
 * @param meetingName - Nombre de la reunión
 * @param clientId - ID del cliente
 * @param coachId - ID del coach
 * @returns Link de Jitsi Meet
 */
export function generateJitsiLinkWithName(
  meetingName: string,
  clientId: string,
  coachId: string
): string {
  // Limpiar el nombre de la reunión para que sea válido como URL
  const cleanName = meetingName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const meetingId = `${cleanName}${clientId}${coachId}`;
  return `https://meet.jit.si/${meetingId}`;
}
