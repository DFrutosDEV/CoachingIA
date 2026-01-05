import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';

// PUT /api/client/tasks/goals/[id] - Actualizar estado de completado de una tarea
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: goalId } = await params;
    const { isCompleted, surveyRating, surveyComment } = await request.json();

    if (typeof isCompleted !== 'boolean') {
      return NextResponse.json(
        { error: 'isCompleted debe ser un valor booleano' },
        { status: 400 }
      );
    }

    // Validar surveyRating si se proporciona
    if (surveyRating && !['excellent', 'so-so', 'bad'].includes(surveyRating)) {
      return NextResponse.json(
        { error: 'surveyRating debe ser uno de: excellent, so-so, bad' },
        { status: 400 }
      );
    }

    // Verificar que la tarea existe
    const existingGoal = await Goal.findById(goalId);
    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    // Preparar los datos de actualización
    const updateData: any = { isCompleted };

    // Si se completa la tarea, agregar los datos de la encuesta
    if (isCompleted) {
      if (surveyRating) {
        updateData.surveyRating = surveyRating;
      }
      if (surveyComment !== undefined) {
        updateData.surveyComment = surveyComment || '';
      }
    }

    // Actualizar el estado de completado y los datos de la encuesta
    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: isCompleted
        ? 'Tarea marcada como completada'
        : 'Tarea marcada como incompleta',
      goal: {
        _id: updatedGoal._id.toString(),
        description: updatedGoal.description,
        day: updatedGoal.day,
        isCompleted: updatedGoal.isCompleted,
        createdAt: updatedGoal.createdAt,
        surveyRating: updatedGoal.surveyRating,
        surveyComment: updatedGoal.surveyComment,
      },
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
