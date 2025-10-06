import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth-jwt';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar que el usuario sea admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validar que el ID sea válido
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID de cliente requerido' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar el perfil del cliente y marcarlo como eliminado
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Cliente no encontrado o ya eliminado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cliente dado de baja exitosamente',
        profile: {
          id: updatedProfile._id,
          name: updatedProfile.name,
          lastName: updatedProfile.lastName,
          isDeleted: updatedProfile.isDeleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al dar de baja al cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
