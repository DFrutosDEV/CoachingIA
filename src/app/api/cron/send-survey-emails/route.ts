import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Profile from '@/models/Profile';
import User from '@/models/User';
import { sendEmailWithBrevo, renderTemplateFromData } from '@/lib/services/email-service';
import { generateToken } from '@/lib/auth-jwt';

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

// Función para procesar Goals completados y enviar emails de encuesta
async function processCompletedGoalsAndSendSurveys() {
  const startTime = new Date();
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 INICIO: Envío de encuestas de Goals completados');
  console.log(`⏰ Timestamp inicio: ${startTime.toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════');

  try {
    console.log('📡 Conectando a la base de datos...');
    await connectDB();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener la fecha de hoy en UTC (solo día, sin hora)
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    console.log('─────────────────────────────────────────────────────────');
    console.log(`📅 Buscando Goals completados del día: ${todayStart.toISOString().split('T')[0]}`);
    console.log(`   Rango de búsqueda: ${todayStart.toISOString()} - ${todayEnd.toISOString()}`);
    console.log('─────────────────────────────────────────────────────────');

    // Obtener Goals del día actual que estén completados, no eliminados, y que no tengan encuesta ya enviada
    console.log('🔍 Ejecutando consulta de Goals...');
    console.log('   Filtros: isDeleted=false, isCompleted=true, date=hoy, surveyRating=null');

    const completedGoalsToday = await Goal.find({
      date: {
        $gte: todayStart,
        $lt: todayEnd,
      },
      isDeleted: false,
      isCompleted: true,
      $or: [
        { surveyRating: { $exists: false } },
        { surveyRating: null },
      ],
    })
      .populate({
        path: 'clientId',
        model: Profile,
        select: 'name lastName user',
        populate: {
          path: 'user',
          model: User,
          select: 'email',
        },
      })
      .sort({ date: 1 });

    console.log(`📊 Goals completados encontrados: ${completedGoalsToday.length}`);

    if (completedGoalsToday.length === 0) {
      console.log('📭 No hay Goals completados para hoy que necesiten encuesta');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🏁 FIN: Proceso completado sin Goals para procesar');
      console.log('═══════════════════════════════════════════════════════════');
      return;
    }

    console.log('─────────────────────────────────────────────────────────');
    console.log(`📬 Iniciando procesamiento de ${completedGoalsToday.length} encuestas`);
    console.log('─────────────────────────────────────────────────────────');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Procesar cada Goal
    for (const goal of completedGoalsToday) {
      processedCount++;

      console.log('');
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 Goal ${processedCount}/${completedGoalsToday.length}`);
      console.log(`   Goal ID: ${goal._id}`);

      try {
        // Verificar que el Goal tiene los datos necesarios
        if (!goal.clientId) {
          console.warn(`   ⚠️  Goal ${goal._id} no tiene clientId, saltando...`);
          errorCount++;
          continue;
        }

        const clientProfile = goal.clientId as any;
        const clientUser = clientProfile?.user as any;

        console.log(`   Cliente: ${clientProfile.name || ''} ${clientProfile.lastName || ''}`.trim() || 'N/A');

        // Verificar que el cliente tiene email
        if (!clientUser || !clientUser.email) {
          console.warn(`   ⚠️  Cliente ${clientProfile._id} no tiene email, saltando Goal ${goal._id}...`);
          errorCount++;
          continue;
        }

        const clientEmail = clientUser.email;
        const clientName = `${clientProfile.name || ''} ${clientProfile.lastName || ''}`.trim() || 'Cliente';

        console.log(`   📧 Email destino: ${clientEmail}`);
        console.log(`   📝 Descripción: ${goal.description?.substring(0, 50) || 'N/A'}...`);

        // Generar token JWT con el goalId (expira en 2 días)
        const token = generateToken({ goalId: goal._id.toString() }, '2d');
        const surveyUrl = `${baseUrl}/it/survey?token=${encodeURIComponent(token)}`;

        console.log(`   🔐 Token generado (expira en 2 días)`);
        console.log(`   🔗 URL de encuesta: ${surveyUrl}`);

        // Preparar datos para el template
        const templateData = {
          clientName,
          goalDescription: goal.description || '',
          surveyUrl,
        };

        // Renderizar el template con los datos (en italiano)
        console.log(`   📄 Renderizando template HTML...`);
        const html = await renderTemplateFromData(
          'survey-email-it.html',
          JSON.stringify(templateData)
        );
        console.log(`   ✅ Template renderizado (${Math.round(html.length / 1024)}KB)`);

        // Enviar el email (subject en italiano)
        const emailSubject = `📝 Come è andata la tua sfida di oggi?`;
        console.log(`   📧 Enviando email...`);
        console.log(`      Asunto: ${emailSubject}`);
        console.log(`      Destino: ${clientEmail}`);

        const emailResult = await sendEmailWithBrevo({
          to: clientEmail,
          subject: emailSubject,
          html,
        });

        if (emailResult.success) {
          console.log(`   ✅ Email enviado exitosamente`);
          successCount++;
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        } else {
          throw new Error(emailResult.error || 'Error desconocido al enviar email');
        }
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';

        console.error(`   ❌ Error procesando Goal:`);
        console.error(`      Mensaje: ${errorMessage}`);
        if (error instanceof Error && error.stack) {
          console.error(`      Stack: ${error.stack}`);
        }

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }

      // Pequeña pausa entre envíos para no sobrecargar el servidor SMTP
      if (processedCount < completedGoalsToday.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const executionTime = Date.now() - startTime.getTime();
    const endTime = new Date();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DEL PROCESAMIENTO');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`⏰ Inicio: ${startTime.toISOString()}`);
    console.log(`⏰ Fin: ${endTime.toISOString()}`);
    console.log(`⏱️  Duración: ${(executionTime / 1000).toFixed(2)} segundos`);
    console.log(`📬 Total procesados: ${processedCount}`);
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📈 Tasa de éxito: ${processedCount > 0 ? ((successCount / processedCount) * 100).toFixed(1) : 0}%`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏁 FIN: Proceso completado');
    console.log('═══════════════════════════════════════════════════════════');
  } catch (error) {
    const executionTime = Date.now() - startTime.getTime();
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';

    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('💥 ERROR CRÍTICO EN CRON JOB');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(`⏱️  Duración antes del error: ${(executionTime / 1000).toFixed(2)} segundos`);
    console.error(`❌ Mensaje: ${errorMessage}`);
    if (error instanceof Error && error.stack) {
      console.error(`📚 Stack trace:`);
      console.error(error.stack);
    }
    console.error('═══════════════════════════════════════════════════════════');
  }
}

// Endpoint GET: si viene de cron job de Vercel, ejecuta la misma lógica que POST
// Si no, devuelve estadísticas (para debugging)
export async function GET(request: NextRequest) {
  const requestStartTime = new Date();

  // Verificar si viene de un cron job de Vercel
  const isVercelCron = request.headers.get('x-vercel-cron') !== null ||
    request.headers.get('authorization')?.startsWith('Bearer') === true;

  // Si viene de un cron job, ejecutar la misma lógica que POST
  if (isVercelCron) {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║        ENDPOINT CRON (GET): send-survey-emails          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`📥 Request recibido: ${requestStartTime.toISOString()}`);

    try {
      // Verificar autorización
      // if (!verifyCronAuth(request)) {
      //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      // }

      console.log('🚀 Iniciando procesamiento en background...');

      // Iniciar procesamiento en background y devolver respuesta inmediata
      await processCompletedGoalsAndSendSurveys().catch(error => {
        console.error('💥 Error no manejado en procesamiento en background:', error);
      });

      const responseTime = Date.now() - requestStartTime.getTime();
      console.log(`✅ Respuesta enviada en ${responseTime}ms`);

      // Devolver respuesta inmediata para evitar timeouts
      return NextResponse.json({
        success: true,
        message: 'Procesamiento de encuestas iniciado en background',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      console.error('💥 Error en endpoint GET (cron):', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Error interno del servidor',
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  }

  // Si no es un cron job, devolver estadísticas (para debugging)
  try {
    await connectDB();

    // Obtener la fecha de hoy en UTC
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    // Obtener Goals completados de hoy que no tengan encuesta
    const completedGoalsToday = await Goal.find({
      date: {
        $gte: todayStart,
        $lt: todayEnd,
      },
      isDeleted: false,
      isCompleted: true,
      $or: [
        { surveyRating: { $exists: false } },
        { surveyRating: null },
      ],
    })
      .populate({
        path: 'clientId',
        model: Profile,
        select: 'name lastName',
      })
      .sort({ date: 1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        completedGoalsNeedingSurvey: completedGoalsToday.length,
      },
      goals: completedGoalsToday.map(goal => ({
        id: goal._id,
        description: goal.description,
        date: goal.date,
        clientName: `${(goal.clientId as any)?.name || ''} ${(goal.clientId as any)?.lastName || ''}`.trim() || 'N/A',
      })),
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de Goals completados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

