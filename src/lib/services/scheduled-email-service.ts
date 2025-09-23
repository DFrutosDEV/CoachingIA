import connectDB from '@/lib/mongodb';
import Email from '@/models/Email';

export interface ScheduledEmailData {
  to: string;
  subject: string;
  html: string;
  sendDate: Date;
  maxRetries?: number;
}

/**
 * Agrega un email a la cola de envío programado
 * @param emailData Datos del email a programar
 * @returns Promise con el resultado de la operación
 */
export const scheduleEmail = async (emailData: ScheduledEmailData) => {
  try {
    await connectDB();

    const email = new Email({
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      sendDate: emailData.sendDate,
      maxRetries: emailData.maxRetries || 3,
      status: 'pending'
    });

    const savedEmail = await email.save();
    
    console.log(`📅 Email programado para ${emailData.sendDate.toISOString()}: ${emailData.to}`);
    
    return {
      success: true,
      data: {
        id: savedEmail._id,
        to: savedEmail.to,
        subject: savedEmail.subject,
        sendDate: savedEmail.sendDate,
        status: savedEmail.status
      }
    };

  } catch (error) {
    console.error('Error programando email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Programa múltiples emails en lote
 * @param emails Array de emails a programar
 * @returns Promise con el resultado de la operación
 */
export const scheduleMultipleEmails = async (emails: ScheduledEmailData[]) => {
  try {
    await connectDB();

    const emailsToCreate = emails.map(emailData => ({
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      sendDate: emailData.sendDate,
      maxRetries: emailData.maxRetries || 3,
      status: 'pending' as const
    }));

    const savedEmails = await Email.insertMany(emailsToCreate);
    
    console.log(`📅 ${savedEmails.length} emails programados exitosamente`);
    
    return {
      success: true,
      data: savedEmails.map(email => ({
        id: email._id,
        to: email.to,
        subject: email.subject,
        sendDate: email.sendDate,
        status: email.status
      }))
    };

  } catch (error) {
    console.error('Error programando múltiples emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene emails programados en un rango de fechas
 * @param startDate Fecha de inicio
 * @param endDate Fecha de fin
 * @returns Promise con los emails encontrados
 */
export const getScheduledEmails = async (startDate: Date, endDate: Date) => {
  try {
    await connectDB();

    const emails = await Email.find({
      sendDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ sendDate: 1 });

    return {
      success: true,
      data: emails
    };

  } catch (error) {
    console.error('Error obteniendo emails programados:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Cancela un email programado
 * @param emailId ID del email a cancelar
 * @returns Promise con el resultado de la operación
 */
export const cancelScheduledEmail = async (emailId: string) => {
  try {
    await connectDB();

    const email = await Email.findById(emailId);
    
    if (!email) {
      return {
        success: false,
        error: 'Email no encontrado'
      };
    }

    if (email.status !== 'pending') {
      return {
        success: false,
        error: 'Solo se pueden cancelar emails pendientes'
      };
    }

    await Email.findByIdAndDelete(emailId);
    
    console.log(`🚫 Email cancelado: ${email.to}`);
    
    return {
      success: true,
      message: 'Email cancelado exitosamente'
    };

  } catch (error) {
    console.error('Error cancelando email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene estadísticas de emails programados
 * @returns Promise con las estadísticas
 */
export const getEmailStats = async () => {
  try {
    await connectDB();

    const stats = await Email.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const pendingCount = stats.find(s => s._id === 'pending')?.count || 0;
    const sentCount = stats.find(s => s._id === 'sent')?.count || 0;
    const failedCount = stats.find(s => s._id === 'failed')?.count || 0;

    // Emails próximos a enviar (próximas 24 horas)
    const next24Hours = new Date();
    next24Hours.setHours(next24Hours.getHours() + 24);

    const upcomingEmails = await Email.countDocuments({
      status: 'pending',
      sendDate: {
        $gte: new Date(),
        $lte: next24Hours
      }
    });

    return {
      success: true,
      data: {
        pending: pendingCount,
        sent: sentCount,
        failed: failedCount,
        total: pendingCount + sentCount + failedCount,
        upcoming24h: upcomingEmails
      }
    };

  } catch (error) {
    console.error('Error obteniendo estadísticas de emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
