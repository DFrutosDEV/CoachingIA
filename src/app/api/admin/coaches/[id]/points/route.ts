import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Enterprise from '@/models/Enterprise';

// PUT /api/admin/coaches/[id]/points - Actualizar puntos de un coach.
// Si se restan puntos y el coach tiene empresa asignada, la diferencia se suma a la empresa.
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

    const coachProfile = await Profile.findById(id);
    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    const currentPoints = coachProfile.points ?? 0;
    const pointsToTransfer = currentPoints - points;

    // Si se restan puntos y el coach tiene empresa, sumar la diferencia a la empresa
    if (pointsToTransfer > 0 && coachProfile.enterprise) {
      const enterpriseId = coachProfile.enterprise.toString();
      const enterprise = await Enterprise.findById(enterpriseId);
      if (enterprise && !enterprise.isDeleted) {
        const newEnterprisePoints = (enterprise.points ?? 0) + pointsToTransfer;
        enterprise.points = newEnterprisePoints;
        await enterprise.save();
      }
    }

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
