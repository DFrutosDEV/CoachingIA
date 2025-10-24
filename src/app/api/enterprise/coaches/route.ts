import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Role from '@/models/Role';
import Enterprise from '@/models/Enterprise';

// GET /api/enterprise/coaches - Obtener todos los coaches registrados para la empresa
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const enterpriseId = request.nextUrl.searchParams.get('enterpriseId');
    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: 'ID de empresa requerido' },
        { status: 400 }
      );
    }

    // Obtener el rol de coach
    const coachRole = await Role.findOne({ code: '2' });
    if (!coachRole) {
      return NextResponse.json(
        { success: false, error: 'Rol de coach no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los perfiles de coaches con sus datos de usuario
    const coaches = await Profile.find({
      enterprise: enterpriseId,
      role: coachRole._id,
      isDeleted: false,
    })
      .populate({
        path: 'user',
        model: User,
        select: 'email firstLogin createdAt',
        match: { isDeleted: false },
      })
      .populate({
        path: 'enterprise',
        model: Enterprise,
        select: 'name logo',
      })
      .sort({ createdAt: -1 });

    // Filtrar coaches que tengan usuario válido
    const validCoaches = coaches.filter(coach => coach.user);

    // Formatear la respuesta
    const formattedCoaches = validCoaches.map(coach => ({
      id: coach._id,
      userId: coach.user._id,
      name: coach.name,
      lastName: coach.lastName,
      email: coach.user.email,
      age: coach.age,
      phone: coach.phone,
      bio: coach.bio,
      profilePicture: coach.profilePicture,
      points: coach.points || 0,
      active: !coach.isDeleted,
      firstLogin: coach.user.firstLogin,
      clientsCount: coach.clients ? coach.clients.length : 0,
      enterprise: coach.enterprise
        ? {
            id: coach.enterprise._id,
            name: coach.enterprise.name,
            logo: coach.enterprise.logo,
          }
        : null,
      createdAt: coach.createdAt,
      updatedAt: coach.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCoaches,
      total: formattedCoaches.length,
    });
  } catch (error) {
    console.error('Error al obtener coaches para la empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener coaches para la empresa' },
      { status: 500 }
    );
  }
}
