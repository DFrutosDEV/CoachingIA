import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meet from '@/models/Meet';

// PATCH /api/meets/[id] - Actualizar una sesión específica
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const updateData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de sesión es requerido' },
        { status: 400 }
      );
    }

    // Validar que la sesión existe
    const existingMeet = await Meet.findById(id);
    if (!existingMeet) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar la sesión
    const updatedMeet = await Meet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'clientId',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      },
      {
        path: 'coachId',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      },
      {
        path: 'objectiveId',
        select: 'title description'
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Sesión actualizada correctamente',
      meet: updatedMeet
    });

  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/meets/[id] - Eliminar una sesión
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de sesión es requerido' },
        { status: 400 }
      );
    }

    // Validar que la sesión existe
    const existingMeet = await Meet.findById(id);
    if (!existingMeet) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la sesión
    await Meet.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Sesión eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/meets/[id] - Obtener una sesión específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de sesión es requerido' },
        { status: 400 }
      );
    }

    const meet = await Meet.findById(id)
      .populate([
        {
          path: 'clientId',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        },
        {
          path: 'coachId',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        },
        {
          path: 'objectiveId',
          select: 'title description'
        }
      ]);

    if (!meet) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      meet
    });

  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 