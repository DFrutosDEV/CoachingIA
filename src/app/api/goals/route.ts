import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';
import User from '@/models/User';
import { scheduleDailyObjectiveEmail, sendEmailWithBrevo, renderTemplateFromData } from '@/lib/services/email-service';

// POST /api/goals - Crear goals (múltiples o individual)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      objectiveId,
      goals,
      description,
      date,
      aforism,
      tiempoEstimado,
      ejemplo,
      indicadorExito,
    } = body;

    // Si se proporciona description y day, crear una meta individual
    if (!objectiveId) {
      return NextResponse.json(
        { error: 'objectiveId es requerido' },
        { status: 400 }
      );
    }

    const objective = await Objective.findById(objectiveId);
    const coachProfile = await Profile.findById(objective?.coachId);
    const clientProfile = await Profile.findById(objective?.clientId);

    if (description) {
      // Usar la fecha proporcionada o la fecha de hoy como fallback
      const goalDate = date ? new Date(date) : new Date();

      const newGoal = new Goal({
        objectiveId,
        description,
        createdBy: coachProfile?._id,
        clientId: clientProfile?._id,
        date: goalDate.toISOString(),
        isCompleted: false,
        isDeleted: false,
        aforism: aforism || '',
        tiempoEstimado: tiempoEstimado || '',
        ejemplo: ejemplo || '',
        indicadorExito: indicadorExito || '',
      });

      const createdGoal = await newGoal.save();

      return NextResponse.json({
        success: true,
        message: 'Meta creada correctamente',
        goal: createdGoal,
      });
    }

    // Si se proporciona goals array, crear múltiples metas
    if (goals && Array.isArray(goals)) {
      if (!objectiveId) {
        return NextResponse.json(
          { error: 'objectiveId y goals son requeridos' },
          { status: 400 }
        );
      }

      // Crear los goals en la base de datos
      const goalsToCreate = goals.map((goal: any, index: number) => {
        // Si el goal viene con date, usarla; si no, calcular una fecha por defecto
        const goalDate = goal.date
          ? new Date(goal.date)
          : new Date(new Date().setDate(new Date().getDate() + index));

        // Extraer el día del mes de la fecha para el campo day (compatibilidad con el modelo)
        const dayOfMonth = goalDate.getDate().toString();

        return {
          objectiveId,
          description: goal.description || goal.title,
          createdBy: coachProfile?._id,
          clientId: clientProfile?._id,
          day: dayOfMonth, // Día del mes extraído de la fecha
          date: goalDate.toISOString(),
          isCompleted: false,
          isDeleted: false,
          aforism: goal.aforism || '',
          tiempoEstimado: goal.tiempoEstimado || '',
          ejemplo: goal.ejemplo || '',
          indicadorExito: goal.indicadorExito || '',
        };
      });

      const createdGoals = await Goal.insertMany(goalsToCreate);

      // Programar emails diarios para cada goal
      try {
        // Obtener información del objetivo y cliente con email
        const objective = await Objective.findById(objectiveId);
        const client = await Profile.findById(clientProfile?._id)
          .populate({
            path: 'user',
            model: User,
            select: 'email',
          });

        if (objective && client) {
          const clientUser = (client as any).user as any;
          const clientEmail = clientUser?.email;

          if (clientEmail) {
            // Verificar si el primer goal tiene fecha de hoy
            const firstGoal = createdGoals[0];
            const firstGoalDate = new Date(firstGoal.date);
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);

            const isFirstGoalToday = firstGoalDate >= todayStart && firstGoalDate < todayEnd;

            // Programar email para cada goal creado
            for (let i = 0; i < createdGoals.length; i++) {
              const goal = createdGoals[i];
              const sendDate = new Date(goal.date);

              // Configurar hora de envío (por ejemplo, 9 AM hora local)
              sendDate.setHours(9, 0, 0, 0);

              // Si es el primer goal y tiene fecha de hoy, enviar inmediatamente
              if (i === 0 && isFirstGoalToday) {
                // Preparar nombre del cliente (disponible para try y catch)
                const clientName = `${clientProfile?.name || ''} ${clientProfile?.lastName || ''}`.trim() || 'Client';
                
                try {
                  console.log(`📧 Enviando email inmediato para el primer desafío del día...`);
                  
                  // Obtener todos los Goals del mismo Objective para calcular progreso
                  const allGoalsOfObjective = await Goal.find({
                    objectiveId: objective._id,
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

                  // Renderizar el template con los datos
                  const html = await renderTemplateFromData(
                    'daily-objective-it.html', // TODO: HACERLO DINAMICO PARA EL IDIOMA
                    JSON.stringify(templateData)
                  );

                  // Enviar el email inmediatamente
                  const emailSubject = `🎯 Your Daily Goal - ${objective.title || 'Goal'}`;
                  const emailResult = await sendEmailWithBrevo({
                    to: clientEmail,
                    subject: emailSubject,
                    html,
                  });

                  if (emailResult.success) {
                    // Actualizar el Goal a status: 'sent'
                    goal.status = 'sent';
                    await goal.save();
                    console.log(`✅ Email enviado inmediatamente para el primer desafío del día`);
                  } else {
                    throw new Error(emailResult.error || 'Error desconocido al enviar email');
                  }
                } catch (immediateEmailError) {
                  console.error('Error enviando email inmediato:', immediateEmailError);
                  // Continuar con la programación normal si falla el envío inmediato
                  const sendDate = new Date(goal.date);
                  sendDate.setHours(9, 0, 0, 0);

                  const emailResult = await scheduleDailyObjectiveEmail(
                    clientEmail,
                    clientName,
                    objective.title,
                    goal.description,
                    i + 1, // currentDay
                    createdGoals.length, // totalDays
                    0, // completedGoals (al inicio, 0 completados)
                    createdGoals.length, // totalGoals
                    sendDate,
                    goal.aforism,
                    goal.tiempoEstimado,
                    goal.ejemplo,
                    goal.indicadorExito
                  );

                  if (!emailResult.success) {
                    console.error(`Error programando email para goal ${goal._id}:`, emailResult.error);
                  }
                }
              } else {
                // Programar email normalmente para los demás goals
                const clientName = `${clientProfile?.name || ''} ${clientProfile?.lastName || ''}`.trim() || 'Client';
                const emailResult = await scheduleDailyObjectiveEmail(
                  clientEmail,
                  clientName,
                  objective.title,
                  goal.description,
                  i + 1, // currentDay
                  createdGoals.length, // totalDays
                  0, // completedGoals (al inicio, 0 completados)
                  createdGoals.length, // totalGoals
                  sendDate,
                  goal.aforism,
                  goal.tiempoEstimado,
                  goal.ejemplo,
                  goal.indicadorExito
                );

                if (!emailResult.success) {
                  console.error(`Error programando email para goal ${goal._id}:`, emailResult.error);
                }
              }
            }

            console.log(`📧 ${createdGoals.length} emails diarios programados exitosamente`);
            if (isFirstGoalToday) {
              console.log(`📧 Email del primer desafío enviado inmediatamente`);
            }
          }
        }
      } catch (emailError) {
        console.error('Error programando emails diarios:', emailError);
        // No fallar la creación de goals si hay error en los emails
      }

      return NextResponse.json({
        success: true,
        message: `${createdGoals.length} metas creadas correctamente`,
        goals: createdGoals,
      });
    }

    return NextResponse.json(
      {
        error:
          'Se requiere description y day para meta individual, o goals array para múltiples metas',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error al crear goals:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/goals - Obtener goals de un cliente
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objectiveId');

    const goals = await Goal.find({ objectiveId, isDeleted: false })
      .populate('objectiveId', 'title description')
      .sort({ day: 1, createdAt: 1 });

    return NextResponse.json({
      success: true,
      goals,
    });
  } catch (error) {
    console.error('Error al obtener goals:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
