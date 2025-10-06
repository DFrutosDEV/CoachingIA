import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';

// PUT /api/goals/[id] - Actualizar una meta específica
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await params;
  console.log('goalId', goalId);
  try {
    await connectDB();
    const updateData = await request.json();

    // Validar que la meta existe
    const existingGoal = await Goal.findById(goalId);
    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Meta no encontrada' },
        { status: 404 }
      );
    }

    // Campos permitidos para actualizar
    const allowedFields = ['description', 'day', 'isCompleted'];
    const filteredData: any = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const updatedGoal = await Goal.findByIdAndUpdate(goalId, filteredData, {
      new: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Meta actualizada correctamente',
      goal: updatedGoal,
    });
  } catch (error) {
    console.error('Error al actualizar meta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id] - Eliminar una meta específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await params;
  try {
    await connectDB();

    // Validar que la meta existe
    const existingGoal = await Goal.findById(goalId);
    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Meta no encontrada' },
        { status: 404 }
      );
    }

    // Soft delete - marcar como eliminada en lugar de eliminar físicamente
    await Goal.findByIdAndUpdate(goalId, { isDeleted: true });

    return NextResponse.json({
      success: true,
      message: 'Meta eliminada correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar meta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
