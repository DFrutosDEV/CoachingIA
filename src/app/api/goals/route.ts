import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';

// POST /api/goals - Crear múltiples goals para un cliente
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { clientId, coachId, objectiveId, goals } = await request.json();
    
    if (!clientId || !coachId || !objectiveId || !goals || !Array.isArray(goals)) {
      return NextResponse.json(
        { error: 'clientId, coachId, objectiveId y goals son requeridos' },
        { status: 400 }
      );
    }

    // Crear los goals en la base de datos
    const goalsToCreate = goals.map((goal: any) => ({
      objectiveId,
      description: goal.title,
      createdBy: coachId,
      clientId,
      day: goal.day || 'Lunes',
      isCompleted: false,
      feedbackId: null, // Por ahora siempre null, se puede actualizar después
      isDeleted: false
    }));

    const createdGoals = await Goal.insertMany(goalsToCreate);

    return NextResponse.json({
      success: true,
      message: `${createdGoals.length} objetivos creados correctamente`,
      goals: createdGoals
    });

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
    const clientId = searchParams.get('clientId');
    const objectiveId = searchParams.get('objectiveId');
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID es requerido' },
        { status: 400 }
      );
    }

    const query: any = { 
      clientId, 
      isDeleted: false 
    };

    if (objectiveId) {
      query.objectiveId = objectiveId;
    }

    const goals = await Goal.find(query)
      .populate('objectiveId', 'title description')
      .sort({ day: 1, createdAt: 1 });

    return NextResponse.json({
      success: true,
      goals
    });

  } catch (error) {
    console.error('Error al obtener goals:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 