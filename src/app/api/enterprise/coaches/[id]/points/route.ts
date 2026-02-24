import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Enterprise from '@/models/Enterprise';
import Role from '@/models/Role';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth-jwt';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

// PUT /api/enterprise/coaches/[id]/points - Transferir puntos de la empresa al coach (solo Empresa)
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

    if (decoded.role !== 'enterprise') {
      return NextResponse.json(
        { error: 'Access denied. Enterprise permissions are required' },
        { status: 403 }
      );
    }

    const { id: coachProfileId } = await params;
    const body = await request.json();
    const { points } = body;

    if (!coachProfileId) {
      return NextResponse.json(
        { error: 'ID del coach es requerido' },
        { status: 400 }
      );
    }

    if (typeof points !== 'number' || points <= 0) {
      return NextResponse.json(
        { error: 'Los puntos a asignar deben ser un número mayor a 0' },
        { status: 400 }
      );
    }

    await connectDB();

    const enterpriseRole = await Role.findOne({ code: '4' });
    if (!enterpriseRole) {
      return NextResponse.json(
        { error: 'Rol de empresa no encontrado' },
        { status: 500 }
      );
    }

    const callerProfile = await Profile.findOne({
      user: decoded.userId,
      role: enterpriseRole._id,
      isDeleted: false,
    });
    if (!callerProfile || !callerProfile.enterprise) {
      return NextResponse.json(
        { error: 'Perfil de empresa no encontrado' },
        { status: 403 }
      );
    }

    const enterpriseId = callerProfile.enterprise.toString();

    const coachProfile = await Profile.findById(coachProfileId);
    if (!coachProfile || coachProfile.isDeleted) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    const coachEnterpriseId = coachProfile.enterprise?.toString() || null;
    if (coachEnterpriseId !== enterpriseId) {
      return NextResponse.json(
        { error: 'Solo puedes asignar puntos a coaches de tu empresa' },
        { status: 403 }
      );
    }

    const enterprise = await Enterprise.findById(enterpriseId);
    if (!enterprise || enterprise.isDeleted) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const currentPoints = enterprise.points ?? 0;
    if (currentPoints < points) {
      return NextResponse.json(
        { error: 'Puntos insuficientes en la empresa' },
        { status: 400 }
      );
    }

    enterprise.points = currentPoints - points;
    coachProfile.points = (coachProfile.points || 0) + points;
    await enterprise.save();
    await coachProfile.save();

    return NextResponse.json({
      success: true,
      message: 'Puntos asignados al coach correctamente',
      data: {
        coachId: coachProfile._id,
        coachPoints: coachProfile.points,
        enterprisePoints: enterprise.points,
      },
    });
  } catch (error) {
    console.error('Error al asignar puntos al coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
