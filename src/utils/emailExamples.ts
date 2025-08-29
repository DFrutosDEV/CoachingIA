import { sendEmail, sendBulkEmail } from './emailService';
import { EmailType } from '../types/emailTypes';

/**
 * Ejemplos de uso del sistema de emails
 */

// Ejemplo 1: Email de bienvenida
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const result = await sendEmail(userEmail, EmailType.WELCOME, {
    userName,
    dashboardUrl: 'https://coachingia.com/dashboard',
    // Las variables de la empresa se llenan automáticamente
  });
  
  console.log('Welcome email result:', result);
  return result;
}

// Ejemplo 2: Confirmación de cita
export async function sendAppointmentConfirmation(
  userEmail: string,
  userName: string,
  appointmentData: {
    date: string;
    time: string;
    duration: string;
    coachName: string;
    appointmentType: string;
    meetingLink?: string;
  }
) {
  const result = await sendEmail(userEmail, EmailType.APPOINTMENT_CONFIRMATION, {
    userName,
    appointmentDate: appointmentData.date,
    appointmentTime: appointmentData.time,
    appointmentDuration: appointmentData.duration,
    coachName: appointmentData.coachName,
    appointmentType: appointmentData.appointmentType,
    meetingLink: appointmentData.meetingLink,
    joinMeetingUrl: appointmentData.meetingLink || '#',
    rescheduleUrl: 'https://coachingia.com/reschedule',
    cancelUrl: 'https://coachingia.com/cancel'
  });
  
  console.log('Appointment confirmation result:', result);
  return result;
}

// Ejemplo 3: Recordatorio de cita
export async function sendAppointmentReminder(
  userEmail: string,
  userName: string,
  appointmentData: {
    date: string;
    time: string;
    coachName: string;
    meetingLink?: string;
  }
) {
  const result = await sendEmail(userEmail, EmailType.APPOINTMENT_REMINDER, {
    userName,
    appointmentDate: appointmentData.date,
    appointmentTime: appointmentData.time,
    coachName: appointmentData.coachName,
    meetingLink: appointmentData.meetingLink,
    joinMeetingUrl: appointmentData.meetingLink || '#'
  });
  
  console.log('Appointment reminder result:', result);
  return result;
}

// Ejemplo 4: Reset de contraseña
export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
  const result = await sendEmail(userEmail, EmailType.PASSWORD_RESET, {
    resetUrl: `https://coachingia.com/reset-password?token=${resetToken}`,
    expiryTime: '24 horas'
  });
  
  console.log('Password reset email result:', result);
  return result;
}

// Ejemplo 5: Verificación de cuenta
export async function sendAccountVerificationEmail(userEmail: string, verificationToken: string) {
  const result = await sendEmail(userEmail, EmailType.ACCOUNT_VERIFICATION, {
    verificationUrl: `https://coachingia.com/verify-account?token=${verificationToken}`,
    expiryTime: '7 días'
  });
  
  console.log('Account verification email result:', result);
  return result;
}

// Ejemplo 6: Newsletter masivo
export async function sendNewsletterToSubscribers(
  subscribers: string[],
  newsletterData: {
    title: string;
    content: string;
    featuredArticle?: string;
  }
) {
  const result = await sendBulkEmail(subscribers, EmailType.NEWSLETTER, {
    newsletterTitle: newsletterData.title,
    newsletterContent: newsletterData.content,
    featuredArticle: newsletterData.featuredArticle,
    readMoreUrl: 'https://coachingia.com/newsletter'
  });
  
  console.log('Newsletter bulk send result:', result);
  return result;
}

// Ejemplo 7: Seguimiento de sesión de coaching
export async function sendCoachingSessionFollowUp(
  userEmail: string,
  userName: string,
  sessionData: {
    sessionDate: string;
    coachName: string;
    nextSessionDate?: string;
    resources?: string[];
  }
) {
  const result = await sendEmail(userEmail, EmailType.COACHING_SESSION_FOLLOW_UP, {
    userName,
    sessionDate: sessionData.sessionDate,
    coachName: sessionData.coachName,
    nextSessionDate: sessionData.nextSessionDate,
    resources: sessionData.resources?.join(', '),
    bookNextSessionUrl: 'https://coachingia.com/book-session',
    feedbackUrl: 'https://coachingia.com/feedback'
  });
  
  console.log('Coaching session follow-up result:', result);
  return result;
}

// Ejemplo 8: Confirmación de pago
export async function sendPaymentConfirmation(
  userEmail: string,
  userName: string,
  paymentData: {
    amount: string;
    paymentMethod: string;
    transactionId: string;
    service: string;
  }
) {
  const result = await sendEmail(userEmail, EmailType.PAYMENT_CONFIRMATION, {
    userName,
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    transactionId: paymentData.transactionId,
    service: paymentData.service,
    receiptUrl: `https://coachingia.com/receipt/${paymentData.transactionId}`
  });
  
  console.log('Payment confirmation result:', result);
  return result;
}

// Ejemplo 9: Solicitud de feedback
export async function sendFeedbackRequest(
  userEmail: string,
  userName: string,
  sessionData: {
    sessionDate: string;
    coachName: string;
  }
) {
  const result = await sendEmail(userEmail, EmailType.FEEDBACK_REQUEST, {
    userName,
    sessionDate: sessionData.sessionDate,
    coachName: sessionData.coachName,
    feedbackUrl: 'https://coachingia.com/feedback',
    ratingUrl: 'https://coachingia.com/rate-session'
  });
  
  console.log('Feedback request result:', result);
  return result;
}

// Ejemplo 10: Cancelación de cita
export async function sendAppointmentCancellation(
  userEmail: string,
  userName: string,
  appointmentData: {
    date: string;
    time: string;
    coachName: string;
    reason?: string;
  }
) {
  const result = await sendEmail(userEmail, EmailType.APPOINTMENT_CANCELLATION, {
    userName,
    appointmentDate: appointmentData.date,
    appointmentTime: appointmentData.time,
    coachName: appointmentData.coachName,
    cancellationReason: appointmentData.reason || 'Solicitud del usuario',
    rescheduleUrl: 'https://coachingia.com/reschedule',
    contactUrl: 'https://coachingia.com/contact'
  });
  
  console.log('Appointment cancellation result:', result);
  return result;
}

// Función helper para enviar email de prueba
export async function sendTestEmail(email: string) {
  console.log('Enviando email de prueba a:', email);
  
  const result = await sendEmail(email, EmailType.WELCOME, {
    userName: 'Usuario de Prueba',
    dashboardUrl: 'https://coachingia.com/dashboard'
  });
  
  console.log('Test email result:', result);
  return result;
}
