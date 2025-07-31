import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import User from '@/models/User';

// PUT /api/admin/coaches/[id]/deactivate - Dar de baja a un coach
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID del coach es requerido' },
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

    // Marcar como eliminado (soft delete)
    coachProfile.isDeleted = true;
    await coachProfile.save();

    // También marcar el usuario como inactivo
    await User.findByIdAndUpdate(coachProfile.user, { active: false });

    return NextResponse.json({
      success: true,
      message: 'Coach dado de baja exitosamente'
    });

  } catch (error) {
    console.error('Error al dar de baja al coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 