import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import { GOAL_SURVEY_COMMENT_MAX_LENGTH } from '@/lib/constants/goal';

function normalizeComment(comment: unknown) {
  if (typeof comment !== 'string') {
    return '';
  }

  return comment.trim();
}

// PUT /api/client/tasks/goals/[id] - Actualizar estado de completado de una tarea
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await params;

  try {
    await connectDB();

    const { isCompleted, surveyRating, surveyComment } = await request.json();

    if (typeof isCompleted !== 'boolean') {
      return NextResponse.json(
        { error: 'isCompleted debe ser un valor booleano', status: 'invalid_payload' },
        { status: 400 }
      );
    }

    // Validar surveyRating si se proporciona
    if (surveyRating && !['excellent', 'so-so', 'bad'].includes(surveyRating)) {
      return NextResponse.json(
        {
          error: 'surveyRating debe ser uno de: excellent, so-so, bad',
          status: 'invalid_rating',
        },
        { status: 400 }
      );
    }

    if (isCompleted && !surveyRating) {
      return NextResponse.json(
        {
          error: 'surveyRating es requerido para completar la tarea',
          status: 'missing_rating',
        },
        { status: 400 }
      );
    }

    // Verificar que la tarea existe
    const existingGoal = await Goal.findById(goalId);
    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Tarea no encontrada', status: 'goal_not_found' },
        { status: 404 }
      );
    }

    // Preparar los datos de actualización
    const updateData: any = { isCompleted };

    // Si se completa la tarea, agregar los datos de la encuesta
    if (isCompleted) {
      if (existingGoal.surveyRating) {
        console.info('[survey][client-modal]', {
          goalId,
          result: 'already_answered',
        });
        return NextResponse.json(
          {
            error: 'El semaforo ya fue completado previamente',
            status: 'already_answered',
          },
          { status: 409 }
        );
      }

      updateData.surveyRating = surveyRating;
      updateData.surveyComment = normalizeComment(surveyComment);

      if (updateData.surveyComment.length > GOAL_SURVEY_COMMENT_MAX_LENGTH) {
        return NextResponse.json(
          {
            error: `El comentario no puede exceder ${GOAL_SURVEY_COMMENT_MAX_LENGTH} caracteres`,
            status: 'invalid_comment',
          },
          { status: 400 }
        );
      }
    }

    // Actualizar el estado de completado y los datos de la encuesta
    const updatedGoal = isCompleted
      ? await Goal.findOneAndUpdate(
        {
          _id: goalId,
          $or: [{ surveyRating: { $exists: false } }, { surveyRating: null }],
        },
        updateData,
        { new: true, runValidators: true }
      )
      : await Goal.findByIdAndUpdate(goalId, updateData, {
        new: true,
        runValidators: true,
      });

    if (!updatedGoal) {
      console.info('[survey][client-modal]', {
        goalId,
        result: 'already_answered',
      });
      return NextResponse.json(
        {
          error: 'El semaforo ya fue completado previamente',
          status: 'already_answered',
        },
        { status: 409 }
      );
    }

    console.info('[survey][client-modal]', {
      goalId,
      result: isCompleted ? 'saved' : 'completion_reset',
      rating: updatedGoal.surveyRating ?? null,
    });

    return NextResponse.json({
      success: true,
      status: isCompleted ? 'saved' : 'completion_reset',
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
    console.error('[survey][client-modal]', {
      goalId,
      result: 'server_error',
      error: error instanceof Error ? error.message : 'Error interno del servidor',
    });
    return NextResponse.json(
      { error: 'Error interno del servidor', status: 'server_error' },
      { status: 500 }
    );
  }
}
