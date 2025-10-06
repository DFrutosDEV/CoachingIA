import { NextRequest, NextResponse } from 'next/server';
import {
  scheduleEmail,
  scheduleMultipleEmails,
  ScheduledEmailData,
} from '@/lib/services/scheduled-email-service';

// POST /api/emails/schedule - Programar uno o múltiples emails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar si es un array (múltiples emails) o un objeto (un email)
    if (Array.isArray(body)) {
      // Programar múltiples emails
      const emails: ScheduledEmailData[] = body.map(email => ({
        to: email.to,
        subject: email.subject,
        html: email.html,
        sendDate: new Date(email.sendDate),
        maxRetries: email.maxRetries || 3,
      }));

      // Validar que todos los campos requeridos estén presentes
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        if (!email.to || !email.subject || !email.html || !email.sendDate) {
          return NextResponse.json(
            {
              success: false,
              error: `Email ${i + 1}: Faltan campos requeridos (to, subject, html, sendDate)`,
            },
            { status: 400 }
          );
        }

        // Validar que la fecha de envío no sea en el pasado
        if (email.sendDate < new Date()) {
          return NextResponse.json(
            {
              success: false,
              error: `Email ${i + 1}: La fecha de envío no puede ser en el pasado`,
            },
            { status: 400 }
          );
        }
      }

      const result = await scheduleMultipleEmails(emails);

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `${emails.length} emails programados exitosamente`,
          data: result.data,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 500 }
        );
      }
    } else {
      // Programar un solo email
      const { to, subject, html, sendDate, maxRetries } = body;

      // Validaciones
      if (!to || !subject || !html || !sendDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Faltan campos requeridos: to, subject, html, sendDate',
          },
          { status: 400 }
        );
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Formato de email inválido',
          },
          { status: 400 }
        );
      }

      // Validar que la fecha de envío no sea en el pasado
      const sendDateTime = new Date(sendDate);
      if (sendDateTime < new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: 'La fecha de envío no puede ser en el pasado',
          },
          { status: 400 }
        );
      }

      const emailData: ScheduledEmailData = {
        to,
        subject,
        html,
        sendDate: sendDateTime,
        maxRetries: maxRetries || 3,
      };

      const result = await scheduleEmail(emailData);

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Email programado exitosamente',
          data: result.data,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error programando email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// GET /api/emails/schedule - Obtener estadísticas de emails programados
export async function GET(request: NextRequest) {
  try {
    const { getEmailStats } = await import(
      '@/lib/services/scheduled-email-service'
    );
    const result = await getEmailStats();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas de emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
