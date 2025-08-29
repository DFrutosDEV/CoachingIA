import { EmailType, EmailData, EmailTemplate } from '../types/emailTypes';
import fs from 'fs';
import path from 'path';

// Configuración de la empresa
const COMPANY_CONFIG = {
  name: 'CoachingIA',
  email: 'info@coachingia.com',
  phone: '+54 11 1234-5678',
  address: 'Buenos Aires, Argentina',
  website: 'https://coachingia.com',
  unsubscribeUrl: 'https://coachingia.com/unsubscribe',
  privacyUrl: 'https://coachingia.com/privacy'
};

// Configuración del proveedor de email
const EMAIL_CONFIG = {
  provider: process.env.EMAIL_PROVIDER || 'resend', // 'resend', 'sendgrid', 'nodemailer'
  apiKey: process.env.EMAIL_API_KEY,
  fromEmail: process.env.FROM_EMAIL || COMPANY_CONFIG.email,
  fromName: process.env.FROM_NAME || COMPANY_CONFIG.name
};

// Mapeo de tipos de email a templates
const EMAIL_TEMPLATES: Record<EmailType, string> = {
  [EmailType.WELCOME]: 'welcome.html',
  [EmailType.APPOINTMENT_CONFIRMATION]: 'appointment-confirmation.html',
  [EmailType.APPOINTMENT_REMINDER]: 'appointment-reminder.html',
  [EmailType.APPOINTMENT_CANCELLATION]: 'appointment-cancellation.html',
  [EmailType.PASSWORD_RESET]: 'password-reset.html',
  [EmailType.ACCOUNT_VERIFICATION]: 'account-verification.html',
  [EmailType.NEWSLETTER]: 'newsletter.html',
  [EmailType.COACHING_SESSION_FOLLOW_UP]: 'coaching-session-follow-up.html',
  [EmailType.PAYMENT_CONFIRMATION]: 'payment-confirmation.html',
  [EmailType.PAYMENT_FAILED]: 'payment-failed.html',
  [EmailType.COURSE_ENROLLMENT]: 'course-enrollment.html',
  [EmailType.FEEDBACK_REQUEST]: 'feedback-request.html'
};

// Mapeo de tipos de email a asuntos
const EMAIL_SUBJECTS: Record<EmailType, string> = {
  [EmailType.WELCOME]: '¡Bienvenido a CoachingIA!',
  [EmailType.APPOINTMENT_CONFIRMATION]: 'Confirmación de tu sesión de coaching',
  [EmailType.APPOINTMENT_REMINDER]: 'Recordatorio: Tu sesión de coaching mañana',
  [EmailType.APPOINTMENT_CANCELLATION]: 'Sesión de coaching cancelada',
  [EmailType.PASSWORD_RESET]: 'Restablecer tu contraseña',
  [EmailType.ACCOUNT_VERIFICATION]: 'Verifica tu cuenta',
  [EmailType.NEWSLETTER]: 'Newsletter de CoachingIA',
  [EmailType.COACHING_SESSION_FOLLOW_UP]: 'Seguimiento de tu sesión de coaching',
  [EmailType.PAYMENT_CONFIRMATION]: 'Confirmación de pago',
  [EmailType.PAYMENT_FAILED]: 'Problema con tu pago',
  [EmailType.COURSE_ENROLLMENT]: 'Bienvenido al curso',
  [EmailType.FEEDBACK_REQUEST]: 'Tu opinión es importante'
};

/**
 * Lee un template HTML desde el sistema de archivos
 */
function loadEmailTemplate(templateName: string): string {
  try {
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'emails', templateName);
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`Template ${templateName} not found`);
  }
}

/**
 * Reemplaza las variables en el template con los datos proporcionados
 */
function replaceTemplateVariables(template: string, data: EmailData): string {
  let result = template;
  
  // Reemplazar variables básicas de la empresa
  Object.entries(COMPANY_CONFIG).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  
  // Reemplazar variables personalizadas
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  
  return result;
}

/**
 * Genera el contenido del email basado en el tipo y los datos
 */
function generateEmailContent(emailType: EmailType, data: EmailData): EmailTemplate {
  const templateName = EMAIL_TEMPLATES[emailType];
  const template = loadEmailTemplate(templateName);
  const html = replaceTemplateVariables(template, data);
  const subject = EMAIL_SUBJECTS[emailType];
  
  // Generar versión de texto plano (opcional)
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  return {
    subject,
    html,
    text
  };
}

/**
 * Envía email usando Resend
 */
async function sendWithResend(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  try {
    // TODO: Install resend package: npm install resend
    // const { Resend } = await import('resend');
    // const resend = new Resend(EMAIL_CONFIG.apiKey);
    
    // const result = await resend.emails.send({
    //   from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
    //   to: [to],
    //   subject,
    //   html,
    //   text
    // });
    
    // console.log('Email sent with Resend:', result);
    // return true;
    console.log('Resend not configured - skipping email send');
    return false;
  } catch (error) {
    console.error('Error sending email with Resend:', error);
    return false;
  }
}

/**
 * Envía email usando SendGrid
 */
async function sendWithSendGrid(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  try {
    // TODO: Install sendgrid package: npm install @sendgrid/mail
    // const sgMail = await import('@sendgrid/mail');
    // sgMail.setApiKey(EMAIL_CONFIG.apiKey!);
    
    // const msg = {
    //   to,
    //   from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
    //   subject,
    //   html,
    //   text
    // };
    
    // const result = await sgMail.send(msg);
    // console.log('Email sent with SendGrid:', result);
    // return true;
    console.log('SendGrid not configured - skipping email send');
    return false;
  } catch (error) {
    console.error('Error sending email with SendGrid:', error);
    return false;
  }
}

/**
 * Envía email usando Nodemailer
 */
async function sendWithNodemailer(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  try {
    // TODO: Install nodemailer package: npm install nodemailer @types/nodemailer
    // const nodemailer = await import('nodemailer');
    
    // const transporter = nodemailer.createTransporter({
    //   host: process.env.SMTP_HOST,
    //   port: parseInt(process.env.SMTP_PORT || '587'),
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS
    //   }
    // });
    
    // const result = await transporter.sendMail({
    //   from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
    //   to,
    //   subject,
    //   html,
    //   text
    // });
    
    // console.log('Email sent with Nodemailer:', result);
    // return true;
    console.log('Nodemailer not configured - skipping email send');
    return false;
  } catch (error) {
    console.error('Error sending email with Nodemailer:', error);
    return false;
  }
}

/**
 * Función principal para enviar emails
 */
export async function sendEmail(
  to: string,
  emailType: EmailType,
  data: EmailData = {}
): Promise<{ success: boolean; message: string }> {
  try {
    // Validaciones básicas
    if (!to || !emailType) {
      return { success: false, message: 'Email y tipo son requeridos' };
    }
    
    if (!EMAIL_CONFIG.apiKey) {
      return { success: false, message: 'API key de email no configurada' };
    }
    
    // Generar contenido del email
    const emailContent = generateEmailContent(emailType, data);
    
    // Enviar email según el proveedor configurado
    let success = false;
    
    switch (EMAIL_CONFIG.provider) {
      case 'resend':
        success = await sendWithResend(to, emailContent.subject, emailContent.html, emailContent.text);
        break;
      case 'sendgrid':
        success = await sendWithSendGrid(to, emailContent.subject, emailContent.html, emailContent.text);
        break;
      case 'nodemailer':
        success = await sendWithNodemailer(to, emailContent.subject, emailContent.html, emailContent.text);
        break;
      default:
        return { success: false, message: `Proveedor de email no soportado: ${EMAIL_CONFIG.provider}` };
    }
    
    if (success) {
      return { success: true, message: 'Email enviado exitosamente' };
    } else {
      return { success: false, message: 'Error al enviar el email' };
    }
    
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

/**
 * Función para enviar múltiples emails del mismo tipo
 */
export async function sendBulkEmail(
  recipients: string[],
  emailType: EmailType,
  data: EmailData = {}
): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    recipients.map(recipient => sendEmail(recipient, emailType, data))
  );
  
  const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - sent;
  const errors = results
    .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
    .map(r => r.status === 'rejected' ? r.reason : r.value.message);
  
  return {
    success: sent > 0,
    sent,
    failed,
    errors
  };
}

/**
 * Función para verificar la configuración del email
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!EMAIL_CONFIG.apiKey) {
    errors.push('EMAIL_API_KEY no está configurada');
  }
  
  if (!EMAIL_CONFIG.fromEmail) {
    errors.push('FROM_EMAIL no está configurada');
  }
  
  if (!['resend', 'sendgrid', 'nodemailer'].includes(EMAIL_CONFIG.provider)) {
    errors.push(`Proveedor de email no válido: ${EMAIL_CONFIG.provider}`);
  }
  
  if (EMAIL_CONFIG.provider === 'nodemailer') {
    if (!process.env.SMTP_HOST) errors.push('SMTP_HOST no está configurada');
    if (!process.env.SMTP_USER) errors.push('SMTP_USER no está configurada');
    if (!process.env.SMTP_PASS) errors.push('SMTP_PASS no está configurada');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Exportar configuración para uso externo
export { EMAIL_CONFIG, COMPANY_CONFIG, EMAIL_TEMPLATES, EMAIL_SUBJECTS };
