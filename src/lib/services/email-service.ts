import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Función para procesar templates con variables
const processTemplate = (template: string, variables: Record<string, string>): string => {
  let processedTemplate = template;
  
  // Reemplazar todas las variables {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, value);
  });
  
  return processedTemplate;
};

// Función para leer templates desde archivos
const readTemplate = (templateName: string): string => {
  const templatePath = path.join(process.cwd(), 'src', 'templates', 'emails', templateName);
  
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Error leyendo template ${templateName}:`, error);
    throw new Error(`Template ${templateName} no encontrado`);
  }
};

export const sendEmailWithResend = async (emailData: EmailData) => {
  try {
    resend.domains.create({
      name: process.env.NEXT_PUBLIC_APP_DOMAIN || '',
    })

    const { data, error } = await resend.emails.send({
      from: `CoachingIA <${process.env.NEXT_PUBLIC_APP_EMAIL_FROM}>`,
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
    });

    if (error) {
      console.error('Error enviando email con Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error en sendEmailWithResend:', error);
    return { success: false, error: 'Error enviando email' };
  }
};

// Función genérica para enviar emails usando templates
export const sendTemplateEmail = async (
  templateName: string,
  to: string,
  subject: string,
  variables: Record<string, string>
) => {
  try {
    const template = readTemplate(templateName);
    const html = processTemplate(template, variables);
    
    return sendEmailWithResend({
      to,
      subject,
      html
    });
  } catch (error) {
    console.error(`Error enviando email con template ${templateName}:`, error);
    return { success: false, error: 'Error procesando template' };
  }
};

export const sendWelcomeEmail = async (email: string, name: string, password: string) => {
  const variables = {
    companyName: 'CoachingIA',
    userName: name,
    mailSocio: email,
    passwordSocio: password,
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    companyAddress: process.env.NEXT_PUBLIC_APP_ADDRESS || '',
    companyEmail: process.env.NEXT_PUBLIC_APP_EMAIL_FROM || '',
    companyPhone: process.env.NEXT_PUBLIC_APP_PHONE || '',
    privacyUrl: process.env.NEXT_PUBLIC_APP_PRIVACY_URL || ''
  };
  
  return sendTemplateEmail(
    'welcome.html',
    email,
    '¡Bienvenido a CoachingIA! - Tus credenciales de acceso',
    variables
  );
};
