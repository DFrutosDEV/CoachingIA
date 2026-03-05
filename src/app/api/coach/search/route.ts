import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';

// GET /api/coach/search - Buscar usuarios por nombre, apellido o email
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const profileId = searchParams.get('profileId');
    const normalizedSearch = (search || '').trim().toLowerCase();
    const hasSearch = normalizedSearch.length >= 3;

    // Validar que se proporcione el profileId
    if (!profileId) {
      return NextResponse.json(
        { error: 'Se requiere profileId' },
        { status: 400 }
      );
    }

    // Buscar el perfil solicitante para determinar el rol
    const profile = await Profile.findOne({
      _id: profileId,
      isDeleted: { $ne: true },
    })
      .select('role clients')
      .populate({
        path: 'role',
        select: 'name',
      });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Perfil no encontrado' },
        { status: 400 }
      );
    }

    const roleName = (profile as any)?.role?.name?.toLowerCase();
    let candidateProfiles: any[] = [];

    if (roleName === 'admin') {
      // Si el solicitante es admin, buscar en todos los perfiles activos
      candidateProfiles = await Profile.find({
        isDeleted: { $ne: true },
      })
        .select('_id user name lastName')
        .populate({
          path: 'user',
          select: '_id email isDeleted',
          match: { isDeleted: false },
        });
    } else {
      // Para cualquier otro rol (coach), mantener búsqueda en sus clientes
      await profile.populate({
        path: 'clients',
        match: { isDeleted: { $ne: true } },
        select: '_id user name lastName',
        populate: {
          path: 'user',
          select: '_id email isDeleted',
          match: { isDeleted: false },
        },
      });
      candidateProfiles = (profile as any).clients || [];
    }

    const users = candidateProfiles
      .filter((candidate: any) => candidate.user) // Solo perfiles con usuario válido
      .filter((candidate: any) => {
        if (!hasSearch) return true;
        const fullName = `${candidate.name || ''} ${candidate.lastName || ''}`.toLowerCase();
        const email = (candidate.user?.email || '').toLowerCase();
        return (
          fullName.includes(normalizedSearch) || email.includes(normalizedSearch)
        );
      })
      .map((candidate: any) => ({
        profileId: candidate._id,
        _id: candidate.user._id,
        name: candidate.name,
        lastName: candidate.lastName,
        email: candidate.user.email,
      }));

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
