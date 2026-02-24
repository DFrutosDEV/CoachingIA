import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enterprise from '@/models/Enterprise';
import Profile from '@/models/Profile';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth-jwt';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

// PUT /api/admin/enterprises/[id]/points - Asignar puntos a una empresa (solo Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin permissions are required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { points } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de empresa es requerido' },
        { status: 400 }
      );
    }

    if (typeof points !== 'number' || points < 0) {
      return NextResponse.json(
        { error: 'Los puntos deben ser un número mayor o igual a 0' },
        { status: 400 }
      );
    }

    await connectDB();

    const enterprise = await Enterprise.findById(id);
    if (!enterprise || enterprise.isDeleted) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    enterprise.points = points;
    await enterprise.save();

    return NextResponse.json({
      success: true,
      message: 'Puntos actualizados exitosamente',
      data: {
        id: enterprise._id,
        points: enterprise.points,
      },
    });
  } catch (error) {
    console.error('Error al actualizar puntos de la empresa:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
