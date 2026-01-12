import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';

// PUT /api/goals/[id] - Actualizar un desafio específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await params;
  const log = `Goal: ${goalId}`;
  console.log('Se procesa a actualizar un desafio', log);
  try {
    await connectDB();
    const updateData = await request.json();

    // Validar que la meta existe
    const existingGoal = await Goal.findById(goalId);
    if (!existingGoal) {
      console.log('Desafio no encontrado', log);
      return NextResponse.json(
        { error: 'Desafio no encontrado' },
        { status: 404 }
      );
    }

    // Campos permitidos para actualizar
    const allowedFields = [
      'description',
      'date',
      'isCompleted',
      'surveyRating',
      'surveyComment',
      'aforism',
      'tiempoEstimado',
      'ejemplo',
      'indicadorExito',
    ];
    const filteredData: any = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'date') {
          // Convertir la fecha a ISO string si se proporciona
          filteredData[field] = new Date(updateData[field]).toISOString();
        } else {
          filteredData[field] = updateData[field];
        }
      }
    });

    const updatedGoal = await Goal.findByIdAndUpdate(goalId, filteredData, {
      new: true,
    });

    console.log('Desafio actualizado correctamente', log);
    return NextResponse.json({
      success: true,
      message: 'Desafio actualizado correctamente',
      goal: updatedGoal,
    });
  } catch (error) {
    console.error('Error al actualizar desafio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id] - Eliminar un desafio específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await params;
  const log = `Goal: ${goalId}`;
  console.log('Se procesa a eliminar un desafio', log);
  try {
    await connectDB();

    // Validar que la meta existe
    const existingGoal = await Goal.findById(goalId);
    if (!existingGoal) {
      console.log('Desafio no encontrado', log);
      return NextResponse.json(
        { error: 'Desafio no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete - marcar como eliminada en lugar de eliminar físicamente
    await Goal.findByIdAndUpdate(goalId, { isDeleted: true });

    console.log('Desafio eliminado correctamente', log);
    return NextResponse.json({
      success: true,
      message: 'Desafio eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar desafio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
