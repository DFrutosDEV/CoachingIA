import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';

// GET /api/coach/search - Buscar usuarios por nombre, apellido o email
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const coachId = searchParams.get('coachId');

    // Validar que se proporcione el coachId
    if (!coachId) {
      return NextResponse.json(
        { error: 'Se requiere coachId' },
        { status: 400 }
      );
    }

    // Buscar el perfil del coach
    const coach = await Profile.findOne({
      _id: coachId,
      isDeleted: { $ne: true },
    })
      .select('clients')
      .populate({
        path: 'clients',
        select: '_id user name lastName',
        populate: {
          path: 'user',
          select: '_id email',
          match:
            search && search.length >= 3
              ? {
                  $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                  ],
                }
              : {},
        },
      });

    if (!coach) {
      return NextResponse.json(
        { success: false, error: 'Coach no encontrado' },
        { status: 400 }
      );
    }

    // Filtrar clientes que tengan datos de usuario y que coincidan con la búsqueda
    const users = coach.clients
      .filter((client: any) => client.user) // Solo clientes que tengan datos de usuario
      .map((client: any) => ({
        _id: client.user._id,
        name: client.name,
        lastName: client.lastName,
        email: client.user.email,
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
