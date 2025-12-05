import fs from 'fs';
import path from 'path';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Función para procesar templates con variables
const processTemplate = (
  template: string,
  variables: Record<string, string>
): string => {
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
  const templatePath = path.join(
    process.cwd(),
    'src',
    'templates',
    'emails',
    templateName
  );

  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Error leyendo template ${templateName}:`, error);
    throw new Error(`Template ${templateName} no encontrado`);
  }
};

// Helpers para Brevo
const parseEmailFrom = (fromEnv?: string): { name: string; email: string } => {
  const fallback = { name: 'KytCoaching', email: 'dfrutos.developer@gmail.com' };
  if (!fromEnv) return fallback;
  // Formatos soportados: "Nombre <email@dominio>" o solo "email@dominio"
  const match = fromEnv.match(/^\s*(.+?)\s*<\s*(.+?)\s*>\s*$/);
  if (match) {
    return { name: match[1], email: match[2] };
  }
  // Si es solo email
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fromEnv)) {
    return { name: 'KytCoaching', email: fromEnv };
  }
  return fallback;
};

const postBrevoEmail = async (payload: any) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('Falta BREVO_API_KEY en variables de entorno');
  }
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
      'accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  console.log("Brevo status:", response.status);
  console.log("Brevo status text:", response.statusText);
  console.log("Brevo headers:", JSON.stringify(response.headers, null, 2));
  console.log("Brevo body:", await response.text());
  console.log("Brevo response:", JSON.stringify(response, null, 2));
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Brevo error ${response.status}: ${text || response.statusText}`);
  }
  return response.json();
};

export const sendEmailWithBrevo = async (emailData: EmailData) => {
  try {
    const sender = parseEmailFrom(process.env.EMAIL_FROM);
    const payload = {
      sender: { name: sender.name, email: sender.email },
      to: [{ email: emailData.to }],
      subject: emailData.subject,
      htmlContent: emailData.html,
    };

    const result = await postBrevoEmail(payload);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error enviando email con Brevo:', error);
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

    return sendEmailWithBrevo({
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Error enviando email con template ${templateName}:`, error);
    return { success: false, error: 'Error procesando template' };
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  password: string
) => {
  const variables = {
    companyName: 'KytCoaching',
    userName: name,
    mailSocio: email,
    passwordSocio: password,
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    companyAddress: process.env.NEXT_PUBLIC_APP_ADDRESS || '',
    companyEmail: process.env.NEXT_PUBLIC_APP_EMAIL_FROM || '',
    companyPhone: process.env.NEXT_PUBLIC_APP_PHONE || '',
    privacyUrl: process.env.NEXT_PUBLIC_APP_PRIVACY_URL || '',
  };

  return sendTemplateEmail(
    'welcome.html',
    email,
    '¡Bienvenido a KytCoaching! - Tus credenciales de acceso',
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
    companyName: 'KytCoaching',
    userName: name,
    appointmentDate,
    appointmentTime,
    coachName,
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    companyAddress: process.env.NEXT_PUBLIC_APP_ADDRESS || '',
    companyEmail: process.env.NEXT_PUBLIC_APP_EMAIL_FROM || '',
    companyPhone: process.env.NEXT_PUBLIC_APP_PHONE || '',
  };

  return sendTemplateEmail(
    'appointment-confirmation.html',
    email,
    'Confirmación de Cita - KytCoaching',
    variables
  );
};

// Función para renderizar HTML desde un template y datos JSON
export const renderTemplateFromData = async (
  templateName: string,
  dataJson: string
): Promise<string> => {
  try {
    const template = readTemplate(templateName);
    const data = JSON.parse(dataJson);

    // Combinar datos con variables globales de la empresa
    const allVariables = {
      ...data,
      companyName: process.env.NEXT_PUBLIC_APP_NAME || 'KytCoaching',
      companyAddress: process.env.NEXT_PUBLIC_APP_ADDRESS || '',
      companyEmail: process.env.NEXT_PUBLIC_APP_EMAIL_FROM || '',
      companyPhone: process.env.NEXT_PUBLIC_APP_PHONE || '',
      companyWebsite: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      objectivesUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/objectives`,
      privacyUrl: process.env.NEXT_PUBLIC_APP_PRIVACY_URL || '',
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
    };

    return processTemplate(template, allVariables);
  } catch (error) {
    console.error(`Error renderizando template ${templateName}:`, error);
    throw new Error(`Error procesando template: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Función para programar email diario de objetivo
export const scheduleDailyObjectiveEmail = async (
  clientEmail: string,
  clientName: string,
  objectiveTitle: string,
  objectiveDescription: string,
  currentDay: number,
  totalDays: number,
  completedGoals: number,
  totalGoals: number,
  sendDate: Date,
  aforism?: string,
  tiempoEstimado?: string,
  ejemplo?: string,
  indicadorExito?: string
) => {
  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const Email = (await import('@/models/Email')).default;

    await connectDB();

    // Generar barra de progreso simple
    const progressPercentage = Math.round((completedGoals / totalGoals) * 100);
    const progressBar = '█'.repeat(Math.floor(progressPercentage / 10)) +
      '░'.repeat(10 - Math.floor(progressPercentage / 10));

    // Preparar datos JSON para el template
    const templateData = {
      clientName,
      objectiveTitle,
      objectiveDescription,
      currentDay: currentDay.toString(),
      totalDays: totalDays.toString(),
      completedGoals: completedGoals.toString(),
      totalGoals: totalGoals.toString(),
      progressBar,
      aforism: aforism || '',
      tiempoEstimado: tiempoEstimado || '',
      ejemplo: ejemplo || '',
      indicadorExito: indicadorExito || '',
    };

    // Crear el email en la base de datos
    const email = new Email({
      to: [clientEmail],
      subject: `🎯 Tu Objetivo del Día - ${objectiveTitle}`,
      template: 'daily-objective',
      data: JSON.stringify(templateData),
      sendDate,
      status: 'pending',
      maxRetries: 3,
    });

    const savedEmail = await email.save();

    console.log(
      `📅 Email de objetivo diario programado para ${sendDate.toISOString()}: ${clientEmail}`
    );

    return {
      success: true,
      data: {
        id: savedEmail._id,
        to: savedEmail.to,
        subject: savedEmail.subject,
        sendDate: savedEmail.sendDate,
        status: savedEmail.status,
      },
    };
  } catch (error) {
    console.error('Error programando email de objetivo diario:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Función para verificar la configuración de email
export const checkEmailConfig = async () => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Falta BREVO_API_KEY' };
    }
    // Intento de verificación simple contra el endpoint de cuenta
    const resp = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': apiKey, 'accept': 'application/json' },
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return { success: false, error: `Brevo no verificado: ${text || resp.statusText}` };
    }
    const provider = 'brevo';
    return { success: true, provider, message: 'Brevo API configurado correctamente' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};
