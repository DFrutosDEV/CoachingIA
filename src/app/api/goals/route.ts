import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';
import { scheduleDailyObjectiveEmail } from '@/lib/services/email-service';

// POST /api/goals - Crear goals (múltiples o individual)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      objectiveId,
      goals,
      description,
      day,
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

    if (description && day) {
      // Usar la fecha proporcionada o la fecha de hoy como fallback
      const goalDate = date ? new Date(date) : new Date();

      const newGoal = new Goal({
        objectiveId,
        description,
        createdBy: coachProfile?._id,
        clientId: clientProfile?._id,
        day,
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
        // Obtener información del objetivo y cliente
        const objective = await Objective.findById(objectiveId);
        const client = await Profile.findById(clientProfile?._id);

        if (objective && client && client.email) {
          // Programar email para cada goal creado
          for (let i = 0; i < createdGoals.length; i++) {
            const goal = createdGoals[i];
            const sendDate = new Date(goal.date);

            // Configurar hora de envío (por ejemplo, 9 AM hora local)
            sendDate.setHours(9, 0, 0, 0);

            const emailResult = await scheduleDailyObjectiveEmail(
              client.email,
              `${clientProfile?.firstName} ${clientProfile?.lastName}`,
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

          console.log(`📧 ${createdGoals.length} emails diarios programados exitosamente`);
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
