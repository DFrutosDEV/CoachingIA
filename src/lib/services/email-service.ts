import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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

// Crear transporter de Nodemailer
const createTransporter = async () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'ethereal';
  
  if (emailProvider === 'gmail') {
    // Configuración para Gmail SMTP
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Usar contraseña de aplicación
      }
    });
  } else {
    // Configuración para Ethereal Email (pruebas locales)
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
};

export const sendEmailWithNodemailer = async (emailData: EmailData) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CoachingIA <noreply@coachingia.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Si usamos Ethereal, mostrar la URL de preview
    if (process.env.EMAIL_PROVIDER !== 'gmail') {
      console.log('📧 Email enviado (Ethereal):', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, data: info };
  } catch (error) {
    console.error('Error enviando email con Nodemailer:', error);
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
    
    return sendEmailWithNodemailer({
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

export const sendAppointmentConfirmationEmail = async (
  email: string, 
  name: string, 
  appointmentDate: string, 
  appointmentTime: string,
  coachName: string
) => {
  const variables = {
    companyName: 'CoachingIA',
    userName: name,
    appointmentDate,
    appointmentTime,
    coachName,
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    companyAddress: process.env.NEXT_PUBLIC_APP_ADDRESS || '',
    companyEmail: process.env.NEXT_PUBLIC_APP_EMAIL_FROM || '',
    companyPhone: process.env.NEXT_PUBLIC_APP_PHONE || ''
  };
  
  return sendTemplateEmail(
    'appointment-confirmation.html',
    email,
    'Confirmación de Cita - CoachingIA',
    variables
  );
};

// Función para verificar la configuración de email
export const checkEmailConfig = async () => {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    
    const provider = process.env.EMAIL_PROVIDER || 'ethereal';
    return {
      success: true,
      provider,
      message: provider === 'gmail' ? 'Gmail SMTP configurado correctamente' : 'Ethereal Email configurado para pruebas'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
