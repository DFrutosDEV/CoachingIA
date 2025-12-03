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

  try {
    await connectDB();

    // Obtener la fecha de hoy (solo día, sin hora)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    console.log(
      `📧 Procesando Goals del día: ${todayStart.toISOString().split('T')[0]}`
    );

    // Obtener Goals del día actual que no estén eliminados y estén pendientes (solo de objetivos activos)
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

    // Filtrar Goals que no tienen Objective activo (objectiveId será null si no cumple el match)
    const goalsWithActiveObjectives = goalsOfToday.filter(
      goal => goal.objectiveId !== null && goal.objectiveId !== undefined
    );

    if (goalsWithActiveObjectives.length === 0) {
      console.log('📭 No hay Goals programados para hoy con objetivos activos');
      return;
    }

    console.log(`📬 Encontrados ${goalsWithActiveObjectives.length} Goals para procesar`);

    // Procesar cada Goal
    for (const goal of goalsWithActiveObjectives) {
      processedCount++;

      try {
        // Verificar que el Goal tiene los datos necesarios
        if (!goal.objectiveId || !goal.clientId) {
          console.warn(
            `⚠️ Goal ${goal._id} no tiene objectiveId o clientId, saltando...`
          );
          errorCount++;
          continue;
        }

        const objective = goal.objectiveId as any;
        const clientProfile = goal.clientId as any;
        const clientUser = clientProfile?.user as any;

        // Verificar que el cliente tiene email
        if (!clientUser || !clientUser.email) {
          console.warn(
            `⚠️ Cliente ${clientProfile._id} no tiene email, saltando Goal ${goal._id}...`
          );
          errorCount++;
          continue;
        }

        const clientEmail = clientUser.email;
        const clientName = `${clientProfile.name || ''} ${clientProfile.lastName || ''}`.trim() || 'Client';

        console.log(
          `📤 Procesando Goal ${processedCount}/${goalsWithActiveObjectives.length} para ${clientEmail}`
        );

        // Obtener todos los Goals del mismo Objective para calcular progreso
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

        // Preparar datos para el template
        // Nota: Los Goals generados manualmente pueden no tener aforism, tiempoEstimado, ejemplo, indicadorExito
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
        const html = await renderTemplateFromData(
          'daily-objective-en.html',
          JSON.stringify(templateData)
        );

        // Enviar el email (subject en inglés)
        const emailResult = await sendEmailWithBrevo({
          to: clientEmail,
          subject: `🎯 Your Daily Goal - ${objective.title || 'Goal'}`,
          html,
        });

        if (emailResult.success) {
          // Actualizar el Goal a status: 'sent'
          goal.status = 'sent';
          await goal.save();

          successCount++;
          console.log(
            `✅ Email enviado exitosamente a ${clientEmail} para Goal ${goal._id}`
          );
        } else {
          throw new Error(emailResult.error || 'Error desconocido al enviar email');
        }
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';

        // Actualizar el Goal a status: 'failed'
        try {
          goal.status = 'failed';
          await goal.save();
        } catch (saveError) {
          console.error(`Error actualizando status del Goal ${goal._id}:`, saveError);
        }

        console.error(
          `❌ Error procesando Goal ${goal._id}:`,
          errorMessage
        );
      }

      // Pequeña pausa entre envíos para no sobrecargar el servidor SMTP
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const executionTime = Date.now() - startTime.getTime();

    console.log(
      `📊 Processing completed: ${successCount} successful, ${errorCount} errors, ${processedCount} total`
    );
  } catch (error) {
    const executionTime = Date.now() - startTime.getTime();
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';

    console.error('💥 Error crítico en cron job de emails:', errorMessage);
  }
}

// Función principal para procesar emails programados
export async function POST(request: NextRequest) {
  try {
    // Verificar autorización
    // if (!verifyCronAuth(request)) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // Iniciar procesamiento en background y devolver respuesta inmediata
    processGoalsAndSendEmails().catch(error => {
      console.error('💥 Error no manejado en procesamiento en background:', error);
    });

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

    // Obtener la fecha de hoy
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

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
