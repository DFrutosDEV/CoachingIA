import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Email from '@/models/Email';
import { sendEmailWithNodemailer } from '@/lib/services/email-service';

// Función para verificar autorización del cron job
const verifyCronAuth = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('⚠️ CRON_SECRET no configurado en variables de entorno');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
};

// Función principal para procesar emails programados
export async function POST(request: NextRequest) {
  const startTime = new Date();
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  try {
    // Verificar autorización
    if (!verifyCronAuth(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    // Calcular rango de tiempo para emails a procesar
    const cronIntervalMinutes = parseInt(
      process.env.CRON_INTERVAL_MINUTES || '1'
    );
    const timeBuffer = cronIntervalMinutes * 60 * 1000; // convertir a milisegundos

    const now = new Date();
    const startRange = new Date(now.getTime() - timeBuffer);
    const endRange = new Date(now.getTime() + timeBuffer);

    console.log(
      `📧 Procesando emails programados entre ${startRange.toISOString()} y ${endRange.toISOString()}`
    );

    // Obtener emails pendientes en el rango de tiempo
    const pendingEmails = await Email.find({
      status: 'pending',
      sendDate: {
        $gte: startRange,
        $lte: endRange,
      },
    }).sort({ sendDate: 1 });

    if (pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay emails programados para enviar',
        processedCount: 0,
        executionTime: Date.now() - startTime.getTime(),
      });
    }

    console.log(`📬 Encontrados ${pendingEmails.length} emails para procesar`);

    // Procesar cada email
    for (const emailDoc of pendingEmails) {
      processedCount++;

      try {
        console.log(
          `📤 Enviando email ${processedCount}/${pendingEmails.length} a ${emailDoc.to}`
        );

        // Intentar enviar el email
        const result = await sendEmailWithNodemailer({
          to: emailDoc.to,
          subject: emailDoc.subject,
          html: emailDoc.html,
        });

        if (result.success) {
          // Marcar como enviado
          emailDoc.markAsSent();
          await emailDoc.save();
          successCount++;

          console.log(`✅ Email enviado exitosamente a ${emailDoc.to}`);
        } else {
          throw new Error(result.error || 'Error desconocido al enviar email');
        }
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';

        console.error(
          `❌ Error enviando email a ${emailDoc.to}:`,
          errorMessage
        );

        // Marcar como fallido o reintentar
        if (emailDoc.canRetry()) {
          emailDoc.markAsFailed(errorMessage);
          await emailDoc.save();
          console.log(
            `🔄 Email marcado para reintento (${emailDoc.retryCount}/${emailDoc.maxRetries})`
          );
        } else {
          emailDoc.markAsFailed(errorMessage);
          await emailDoc.save();
          console.log(
            `💀 Email marcado como fallido permanentemente después de ${emailDoc.maxRetries} intentos`
          );
        }
      }

      // Pequeña pausa entre envíos para no sobrecargar el servidor SMTP
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const executionTime = Date.now() - startTime.getTime();

    console.log(
      `📊 Procesamiento completado: ${successCount} exitosos, ${errorCount} errores, ${processedCount} total`
    );

    return NextResponse.json({
      success: true,
      message: `Procesados ${processedCount} emails: ${successCount} exitosos, ${errorCount} errores`,
      processedCount,
      successCount,
      errorCount,
      executionTime,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime.getTime();
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';

    console.error('💥 Error crítico en cron job de emails:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: errorMessage,
        processedCount,
        executionTime,
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar el estado del cron job (opcional, para debugging)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener estadísticas de emails
    const stats = await Email.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const pendingCount = stats.find(s => s._id === 'pending')?.count || 0;
    const sentCount = stats.find(s => s._id === 'sent')?.count || 0;
    const failedCount = stats.find(s => s._id === 'failed')?.count || 0;

    // Obtener próximos emails a enviar
    const nextEmails = await Email.find({ status: 'pending' })
      .sort({ sendDate: 1 })
      .limit(5)
      .select('to subject sendDate retryCount');

    return NextResponse.json({
      success: true,
      stats: {
        pending: pendingCount,
        sent: sentCount,
        failed: failedCount,
        total: pendingCount + sentCount + failedCount,
      },
      nextEmails: nextEmails.map(email => ({
        to: email.to,
        subject: email.subject,
        sendDate: email.sendDate,
        retryCount: email.retryCount,
      })),
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de emails:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
