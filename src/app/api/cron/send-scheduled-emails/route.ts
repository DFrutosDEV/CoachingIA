import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';
import User from '@/models/User';
import { sendEmailWithBrevo, renderTemplateFromData } from '@/lib/services/email-service';

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

// Función para procesar Goals y enviar emails (ejecuta en background)
async function processGoalsAndSendEmails() {
  const startTime = new Date();
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 INICIO: Procesamiento de desafíos programados');
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
    console.log(`📅 Buscando desafíos del día: ${todayStart.toISOString().split('T')[0]}`);
    console.log(`   Rango de búsqueda: ${todayStart.toISOString()} - ${todayEnd.toISOString()}`);
    console.log('─────────────────────────────────────────────────────────');

    // Obtener Goals del día actual que no estén eliminados y estén pendientes (solo de objetivos activos)
    console.log('🔍 Ejecutando consulta de Goals...');
    console.log('   Filtros: isDeleted=false, status=pending, objective.active=true');

    const goalsOfToday = await Goal.find({
      date: {
        $gte: todayStart,
        $lt: todayEnd,
      },
      isDeleted: false,
      status: 'pending',
    })
      .populate({
        path: 'objectiveId',
        model: Objective,
        select: 'title',
        match: { active: true },
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

    console.log(`📊 Goals encontrados en consulta inicial: ${goalsOfToday.length}`);

    // Filtrar Goals que no tienen Objective activo (objectiveId será null si no cumple el match)
    const goalsWithActiveObjectives = goalsOfToday.filter(
      goal => goal.objectiveId !== null && goal.objectiveId !== undefined
    );

    console.log(`📊 Goals con objetivos activos: ${goalsWithActiveObjectives.length}`);

    if (goalsWithActiveObjectives.length === 0) {
      console.log('📭 No hay Goals programados para hoy con objetivos activos');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🏁 FIN: Proceso completado sin desafíos para procesar');
      console.log('═══════════════════════════════════════════════════════════');
      return;
    }

    console.log('─────────────────────────────────────────────────────────');
    console.log(`📬 Iniciando procesamiento de ${goalsWithActiveObjectives.length} desafíos`);
    console.log('─────────────────────────────────────────────────────────');

    // Procesar cada Goal
    for (const goal of goalsWithActiveObjectives) {
      processedCount++;

      console.log('');
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 Desafío ${processedCount}/${goalsWithActiveObjectives.length}`);
      console.log(`   Goal ID: ${goal._id}`);

      try {
        // Verificar que el Goal tiene los datos necesarios
        if (!goal.objectiveId || !goal.clientId) {
          console.warn(`   ⚠️  Goal ${goal._id} no tiene objectiveId o clientId, saltando...`);
          errorCount++;
          continue;
        }

        const objective = goal.objectiveId as any;
        const clientProfile = goal.clientId as any;
        const clientUser = clientProfile?.user as any;

        console.log(`   Objetivo: ${objective.title || 'N/A'}`);
        console.log(`   Cliente: ${clientProfile.name || ''} ${clientProfile.lastName || ''}`.trim() || 'N/A');

        // Verificar que el cliente tiene email
        if (!clientUser || !clientUser.email) {
          console.warn(`   ⚠️  Cliente ${clientProfile._id} no tiene email, saltando Goal ${goal._id}...`);
          errorCount++;
          continue;
        }

        const clientEmail = clientUser.email;
        const clientName = `${clientProfile.name || ''} ${clientProfile.lastName || ''}`.trim() || 'Client';

        console.log(`   📧 Email destino: ${clientEmail}`);
        console.log(`   📝 Descripción: ${goal.description?.substring(0, 50) || 'N/A'}...`);

        // Obtener todos los Goals del mismo Objective para calcular progreso
        console.log(`   🔄 Calculando progreso del objetivo...`);
        const allGoalsOfObjective = await Goal.find({
          objectiveId: goal.objectiveId,
          isDeleted: false,
        }).sort({ date: 1 });

        const totalGoals = allGoalsOfObjective.length;
        const completedGoals = allGoalsOfObjective.filter(g => g.isCompleted).length;

        // Calcular el día actual (posición del Goal en la secuencia)
        const currentDayIndex = allGoalsOfObjective.findIndex(
          g => g._id.toString() === goal._id.toString()
        );
        const currentDay = currentDayIndex >= 0 ? currentDayIndex + 1 : 1;

        // Generar barra de progreso
        const progressPercentage = Math.round((completedGoals / totalGoals) * 100);
        const progressBar = '█'.repeat(Math.floor(progressPercentage / 10)) +
          '░'.repeat(10 - Math.floor(progressPercentage / 10));

        console.log(`   📊 Progreso: Día ${currentDay}/${totalGoals} | Completados: ${completedGoals}/${totalGoals} (${progressPercentage}%)`);
        console.log(`   📈 Barra: ${progressBar}`);

        // Preparar datos para el template
        // Nota: Los Goals generados manualmente pueden no tener aforism, tiempoEstimado, ejemplo, indicadorExito
        console.log(`   🎨 Preparando datos del template...`);
        const templateData = {
          clientName,
          objectiveTitle: objective.title || 'Goal',
          objectiveDescription: goal.description,
          currentDay: currentDay.toString(),
          totalDays: totalGoals.toString(),
          completedGoals: completedGoals.toString(),
          totalGoals: totalGoals.toString(),
          progressBar,
          aforism: goal.aforism || '',
          tiempoEstimado: goal.tiempoEstimado || '',
          ejemplo: goal.ejemplo || '',
          indicadorExito: goal.indicadorExito || '',
        };

        // Renderizar el template con los datos (en inglés)
        console.log(`   📄 Renderizando template HTML...`);
        const html = await renderTemplateFromData(
          'daily-objective-it.html', //TODO: HACERLO DINAMICO PARA EL IDIOMA
          JSON.stringify(templateData)
        );
        console.log(`   ✅ Template renderizado (${Math.round(html.length / 1024)}KB)`);

        // Enviar el email (subject en inglés)
        const emailSubject = `🎯 Your Daily Goal - ${objective.title || 'Goal'}`;
        console.log(`   📧 Enviando email...`);
        console.log(`      Asunto: ${emailSubject}`);
        console.log(`      Destino: ${clientEmail}`);

        const emailResult = await sendEmailWithBrevo({
          to: clientEmail,
          subject: emailSubject,
          html,
        });

        if (emailResult.success) {
          // Actualizar el Goal a status: 'sent'
          console.log(`   ✅ Email enviado exitosamente`);
          console.log(`   💾 Actualizando estado del Goal a 'sent'...`);
          goal.status = 'sent';
          await goal.save();
          console.log(`   ✅ Estado actualizado correctamente`);

          successCount++;
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        } else {
          throw new Error(emailResult.error || 'Error desconocido al enviar email');
        }
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';

        console.error(`   ❌ Error procesando desafío:`);
        console.error(`      Mensaje: ${errorMessage}`);
        if (error instanceof Error && error.stack) {
          console.error(`      Stack: ${error.stack}`);
        }

        // Actualizar el Goal a status: 'failed'
        try {
          console.log(`   💾 Actualizando estado del Goal a 'failed'...`);
          goal.status = 'failed';
          await goal.save();
          console.log(`   ✅ Estado actualizado a 'failed'`);
        } catch (saveError) {
          console.error(`   ⚠️  Error actualizando status del Goal ${goal._id}:`, saveError);
        }

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }

      // Pequeña pausa entre envíos para no sobrecargar el servidor SMTP
      if (processedCount < goalsWithActiveObjectives.length) {
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

// Función principal para procesar emails programados
export async function POST(request: NextRequest) {
  const requestStartTime = new Date();

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║        ENDPOINT CRON: send-scheduled-emails               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`📥 Request recibido: ${requestStartTime.toISOString()}`);

  try {
    // Verificar autorización
    // if (!verifyCronAuth(request)) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    console.log('🚀 Iniciando procesamiento en background...');

    // Iniciar procesamiento en background y devolver respuesta inmediata
    await processGoalsAndSendEmails().catch(error => {
      console.error('💥 Error no manejado en procesamiento en background:', error);
    });

    const responseTime = Date.now() - requestStartTime.getTime();
    console.log(`✅ Respuesta enviada en ${responseTime}ms`);
    // console.log('💡 El procesamiento continúa en background');

    // Devolver respuesta inmediata para evitar timeouts
    return NextResponse.json({
      success: true,
      message: 'Procesamiento de Goals iniciado en background',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';

    console.error('💥 Error en endpoint POST:', errorMessage);
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

// Endpoint GET para verificar el estado del cron job (opcional, para debugging)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener la fecha de hoy en UTC
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    // Obtener Goals de hoy (solo de objetivos activos)
    const goalsToday = await Goal.find({
      date: {
        $gte: todayStart,
        $lt: todayEnd,
      },
      isDeleted: false,
    })
      .populate({
        path: 'objectiveId',
        model: Objective,
        select: 'title active',
        match: { active: true },
      })
      .populate({
        path: 'clientId',
        model: Profile,
        select: 'name lastName',
      })
      .sort({ date: 1 })
      .limit(10);

    // Filtrar Goals que no tienen Objective activo
    const goalsTodayFiltered = goalsToday.filter(
      goal => goal.objectiveId !== null && goal.objectiveId !== undefined
    );

    // Obtener Goals de los próximos días (solo de objetivos activos)
    const nextGoals = await Goal.find({
      date: { $gte: todayEnd },
      isDeleted: false,
    })
      .populate({
        path: 'objectiveId',
        model: Objective,
        select: 'title',
        match: { active: true },
      })
      .populate({
        path: 'clientId',
        model: Profile,
        select: 'name lastName',
      })
      .sort({ date: 1 })
      .limit(5);

    // Filtrar Goals que no tienen Objective activo
    const nextGoalsFiltered = nextGoals.filter(
      goal => goal.objectiveId !== null && goal.objectiveId !== undefined
    );

    return NextResponse.json({
      success: true,
      stats: {
        goalsToday: goalsTodayFiltered.length,
        nextGoals: nextGoalsFiltered.length,
      },
      goalsToday: goalsTodayFiltered.map(goal => ({
        id: goal._id,
        description: goal.description,
        date: goal.date,
        objectiveTitle: (goal.objectiveId as any)?.title || 'N/A',
        clientName: `${(goal.clientId as any)?.name || ''} ${(goal.clientId as any)?.lastName || ''}`.trim() || 'N/A',
      })),
      nextGoals: nextGoalsFiltered.map(goal => ({
        id: goal._id,
        description: goal.description,
        date: goal.date,
        objectiveTitle: (goal.objectiveId as any)?.title || 'N/A',
        clientName: `${(goal.clientId as any)?.name || ''} ${(goal.clientId as any)?.lastName || ''}`.trim() || 'N/A',
      })),
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de Goals:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
