import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Role from '@/models/Role';
import Enterprise from '@/models/Enterprise';

// GET /api/admin/coaches - Obtener todos los coaches registrados
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Buscar el rol de coach
    const coachRole = await Role.findOne({ code: '2' });
    if (!coachRole) {
      return NextResponse.json(
        { error: 'Rol de coach no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los perfiles de coaches con sus datos de usuario
    const coaches = await Profile.find({ 
      role: coachRole._id, 
      isDeleted: false 
    })
    .populate({
      path: 'user',
      model: User,
      select: 'email firstLogin createdAt',
      match: { isDeleted: false }
    })
    .populate({
      path: 'enterprise',
      model: Enterprise,
      select: 'name logo'
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
      active: !coach.isDeleted,
      firstLogin: coach.user.firstLogin,
      clientsCount: coach.clients ? coach.clients.length : 0,
      enterprise: coach.enterprise ? {
        id: coach.enterprise._id,
        name: coach.enterprise.name,
        logo: coach.enterprise.logo
      } : null,
      createdAt: coach.createdAt,
      updatedAt: coach.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedCoaches,
      total: formattedCoaches.length
    });

  } catch (error) {
    console.error('Error al obtener coaches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 