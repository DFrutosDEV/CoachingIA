import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';

// POST /api/goals - Crear goals (múltiples o individual)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { clientId, coachId, objectiveId, goals, description, day } = body;

    // Si se proporciona description y day, crear una meta individual
    if (description && day) {
      if (!clientId || !coachId || !objectiveId) {
        return NextResponse.json(
          { error: 'clientId, coachId y objectiveId son requeridos' },
          { status: 400 }
        );
      }

      const newGoal = new Goal({
        objectiveId,
        description,
        createdBy: coachId,
        clientId,
        day,
        date: new Date().toISOString(),
        isCompleted: false,
        isDeleted: false,
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
      if (!clientId || !coachId || !objectiveId) {
        return NextResponse.json(
          { error: 'clientId, coachId, objectiveId y goals son requeridos' },
          { status: 400 }
        );
      }

      // Crear los goals en la base de datos
      const goalsToCreate = goals.map((goal: any, index: number) => ({
        objectiveId,
        description: goal.description || goal.title,
        createdBy: coachId,
        clientId,
        day: goal.day || 'Lunes',
        date: new Date(
          new Date().setDate(new Date().getDate() + index)
        ).toISOString(),
        isCompleted: false,
        isDeleted: false,
      }));

      const createdGoals = await Goal.insertMany(goalsToCreate);

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
