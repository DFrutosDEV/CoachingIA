import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Objective from '@/models/Objective';
import Feedback from '@/models/Feedback';
import Goal from '@/models/Goal';
import Meet from '@/models/Meet';

// PUT: Finalizar un objetivo con feedback
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { objectiveId, feedback } = body;

    // Validaciones básicas
    if (!objectiveId || !feedback) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: objectiveId, feedback',
        },
        { status: 400 }
      );
    }

    // Buscar el objetivo
    const objective = await Objective.findById(objectiveId);
    if (!objective) {
      return NextResponse.json(
        {
          success: false,
          error: 'Objetivo no encontrado',
        },
        { status: 404 }
      );
    }

    // Verificar que el objetivo no esté ya finalizado
    if (objective.isCompleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'El objetivo ya está finalizado',
        },
        { status: 400 }
      );
    }

    //! ESTO QUEDO DESCARTADO DE MOMENTO
    // Crear el feedback
    // const newFeedback = new Feedback({
    //   coachId: objective.coachId,
    //   clientId: objective.clientId,
    //   objectiveId: objective._id,
    //   feedback: feedback.trim(),
    // });

    // await newFeedback.save();

    // Actualizar el objetivo
    objective.isCompleted = true;
    objective.active = false;
    objective.feedback = feedback.trim();
    await objective.save();

    // Actualizar las metas del objetivo
    const goals = await Goal.find({ objectiveId: objective._id });
    goals.forEach(async goal => {
      goal.isDeleted = true;
      await goal.save();
    });

    // Actualizar las videollamadas del objetivo
    const meets = await Meet.find({ objectiveId: objective._id });
    meets.forEach(async meet => {
      meet.isCancelled = true;
      await meet.save();
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Objetivo finalizado exitosamente con feedback',
        data: {
          feedback: feedback.trim(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en PUT /api/objective/finalize:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
