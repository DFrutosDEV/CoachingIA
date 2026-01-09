import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth-jwt';
import User from '@/models/User';

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
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verificar que el usuario sea admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin permissions are required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validar que el ID sea válido
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Client ID is required' },
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

    if (updatedProfile?.user) {
      await User.findByIdAndUpdate(updatedProfile.user, { isDeleted: true });
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Client not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Client deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in delete client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
