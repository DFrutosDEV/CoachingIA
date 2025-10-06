import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';

// PUT /api/admin/coaches/[id]/points - Actualizar puntos de un coach
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { points } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID del coach es requerido' },
        { status: 400 }
      );
    }

    if (typeof points !== 'number' || points < 0) {
      return NextResponse.json(
        { error: 'Los puntos deben ser un número mayor o igual a 0' },
        { status: 400 }
      );
    }

    // Buscar el perfil del coach
    const coachProfile = await Profile.findById(id);
    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar los puntos
    coachProfile.points = points;
    await coachProfile.save();

    return NextResponse.json({
      success: true,
      message: 'Puntos actualizados exitosamente',
      data: {
        id: coachProfile._id,
        points: coachProfile.points,
      },
    });
  } catch (error) {
    console.error('Error al actualizar puntos del coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
