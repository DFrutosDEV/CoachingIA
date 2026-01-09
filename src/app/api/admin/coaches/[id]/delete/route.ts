import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import User from '@/models/User';

// PUT /api/admin/coaches/[id]/delete - Eliminar un coach
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Coach ID is required' },
        { status: 400 }
      );
    }

    // Buscar el perfil del coach
    const coachProfile = await Profile.findById(id);
    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }

    // Marcar como eliminado (soft delete)
    coachProfile.isDeleted = true;
    await coachProfile.save();

    // También marcar el usuario como inactivo
    await User.findByIdAndUpdate(coachProfile.user, { isDeleted: true });

    return NextResponse.json({
      success: true,
      message: 'Coach deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete coach:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
