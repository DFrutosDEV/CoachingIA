import fs from 'fs';
import { readFile, unlink } from 'fs/promises';
import path from 'path';

export interface EmailAttachment {
  filePath: string;
  fileName: string;
  contentType?: string;
}

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
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

  // Leer el body UNA SOLA VEZ
  const responseText = await response.text();

  console.log("Brevo status:", response.status);
  console.log("Brevo status text:", response.statusText);
  console.log("Brevo headers:", Object.fromEntries(response.headers.entries()));
  console.log("Brevo body:", responseText);

  if (!response.ok) {
    throw new Error(`Brevo error ${response.status}: ${responseText || response.statusText}`);
  }

  // Parsear el JSON del texto ya leído
  try {
    return JSON.parse(responseText);
  } catch (error) {
    // Si no es JSON válido, retornar el texto
    return { message: responseText };
  }
};

const buildBrevoAttachments = async (attachments?: EmailAttachment[]) => {
  if (!attachments?.length) {
    return undefined;
  }

  return Promise.all(
    attachments.map(async attachment => {
      const fileBuffer = await readFile(attachment.filePath);

      return {
        name: attachment.fileName,
        content: fileBuffer.toString('base64'),
      };
    })
  );
};

const cleanupAttachments = async (attachments?: EmailAttachment[]) => {
  if (!attachments?.length) {
    return;
  }

  await Promise.all(
    attachments.map(async attachment => {
      try {
        await unlink(attachment.filePath);
      } catch (error) {
        console.error(`Error eliminando adjunto temporal ${attachment.filePath}:`, error);
      }
    })
  );
};

export const sendEmailWithBrevo = async (emailData: EmailData) => {
  try {
    const sender = parseEmailFrom(process.env.EMAIL_FROM);
    const attachments = await buildBrevoAttachments(emailData.attachments);
    const payload = {
      sender: { name: sender.name, email: sender.email },
      to: (Array.isArray(emailData.to) ? emailData.to : [emailData.to]).map(email => ({
        email,
      })),
      subject: emailData.subject,
      htmlContent: emailData.html,
      ...(attachments ? { attachment: attachments } : {}),
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
  to: string | string[],
  subject: string,
  variables: Record<string, string>,
  attachments?: EmailAttachment[]
) => {
  try {
    const template = readTemplate(templateName);
    const html = processTemplate(template, variables);

    return sendEmailWithBrevo({
      to,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    console.error(`Error enviando email con template ${templateName}:`, error);
    return { success: false, error: 'Error procesando template' };
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  password: string,
  coachData?: {
    name: string;
    lastName: string;
    email: string;
    phone: string;
  },
  enterpriseName?: string
) => {
  // Generar HTML de la firma del coach si hay datos
  let coachSignature = '';
  if (coachData) {
    const emailLine = coachData.email
      ? `<p style="margin: 5px 0; color: #6c757d; font-size: 14px">
                  Email: <a href="mailto:${coachData.email}" style="color: #667eea; text-decoration: none">${coachData.email}</a>
                </p>`
      : '';
    const phoneLine = coachData.phone
      ? `<p style="margin: 5px 0; color: #6c757d; font-size: 14px">
                  Telefono: <a href="tel:${coachData.phone}" style="color: #667eea; text-decoration: none">${coachData.phone}</a>
                </p>`
      : '';

    coachSignature = `
          <tr>
            <td style="padding: 30px 30px 20px 30px; border-top: 1px solid #e9ecef">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea">
                <p style="margin: 0 0 10px 0; color: #495057; font-size: 14px; font-weight: 600">
                  Ti ha dato il benvenuto:
                </p>
                <p style="margin: 5px 0; color: #333333; font-size: 16px; font-weight: 600">
                  ${coachData.name} ${coachData.lastName}
                </p>
                ${emailLine}
                ${phoneLine}
              </div>
            </td>
          </tr>`;
  }

  const variables: Record<string, string> = {
    companyName: 'KytCoaching',
    userName: name,
    mailSocio: email,
    passwordSocio: password,
    enterpriseLine: enterpriseName?.trim()
      ? `<p>Enterprise: ${enterpriseName.trim()}</p>`
      : '',
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    companyAddress: process.env.NEXT_PUBLIC_APP_ADDRESS || '',
    companyEmail: process.env.NEXT_PUBLIC_APP_EMAIL_FROM || '',
    companyPhone: process.env.NEXT_PUBLIC_APP_PHONE || '',
    privacyUrl: process.env.NEXT_PUBLIC_APP_PRIVACY_URL || '',
    coachSignature,
  };

  return sendTemplateEmail(
    'welcome.html',
    email,
    '¡Welcome to KytCoaching! - Your access credentials',
    variables
  );
};

export interface AppointmentConfirmationRecipient {
  email: string;
  name: string;
}

export interface AppointmentConfirmationEmailData {
  recipients: AppointmentConfirmationRecipient[];
  appointmentDate: string;
  appointmentTime: string;
  coachName: string;
  appointmentDuration?: string;
  meetingLink?: string;
  icsAttachment?: EmailAttachment;
}

export const sendAppointmentConfirmationEmail = async ({
  recipients,
  appointmentDate,
  appointmentTime,
  coachName,
  appointmentDuration = '60',
  meetingLink = '',
  icsAttachment,
}: AppointmentConfirmationEmailData) => {
  const validRecipients = recipients.filter(recipient => recipient.email);
  const attachments = icsAttachment ? [icsAttachment] : undefined;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const companyLogo = `${appUrl.replace(/\/$/, '')}/logo.png`;

  if (validRecipients.length === 0) {
    await cleanupAttachments(attachments);
    return { success: false, error: 'No hay destinatarios válidos' };
  }

  try {
    const results = await Promise.all(
      validRecipients.map(recipient => {
        const variables = {
          companyName: 'KytCoaching',
          companyLogo,
          userName: recipient.name,
          appointmentDate,
          appointmentTime,
          coachName,
          appointmentDuration,
          meetingLink,
          companyAddress: process.env.NEXT_PUBLIC_APP_ADDRESS || '',
          companyEmail: process.env.NEXT_PUBLIC_APP_EMAIL_FROM || '',
          companyPhone: process.env.NEXT_PUBLIC_APP_PHONE || '',
          privacyUrl: process.env.NEXT_PUBLIC_APP_PRIVACY_URL || '',
        };

        return sendTemplateEmail(
          'appointment-confirmation.html',
          recipient.email,
          'Conferma Sessione - KytCoaching',
          variables,
          attachments
        );
      })
    );

    const failedResult = results.find(result => !result.success);
    return failedResult || { success: true, data: results.map(result => result.data) };
  } finally {
    await cleanupAttachments(attachments);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  newPassword: string
) => {
  const variables = {
    companyName: 'KytCoaching',
    newPassword,
    companyAddress: process.env.NEXT_PUBLIC_APP_ADDRESS || '',
    companyEmail: process.env.NEXT_PUBLIC_APP_EMAIL_FROM || '',
    companyPhone: process.env.NEXT_PUBLIC_APP_PHONE || '',
  };

  return sendTemplateEmail(
    'reset-password-it.html',
    email,
    'Reset Password - KytCoaching',
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
