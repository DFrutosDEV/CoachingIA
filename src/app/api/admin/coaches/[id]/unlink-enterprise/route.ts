import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth-jwt';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

// PUT /api/admin/coaches/[id]/unlink-enterprise - Desvincular coach de empresa
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

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Coach ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Obtener perfil del admin actual
    const adminProfile = await Profile.findOne({ user: decoded.userId });
    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Admin profile not found' },
        { status: 404 }
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

    // Verificar permisos: admin sin empresa o admin con misma empresa
    const adminEnterpriseId = adminProfile.enterprise?.toString() || null;
    const coachEnterpriseId = coachProfile.enterprise?.toString() || null;

    if (adminEnterpriseId && adminEnterpriseId !== coachEnterpriseId) {
      return NextResponse.json(
        { error: 'Access denied. You can only unlink coaches from your own enterprise' },
        { status: 403 }
      );
    }

    // Desvincular empresa (setear a null)
    coachProfile.enterprise = null;
    await coachProfile.save();

    return NextResponse.json({
      success: true,
      message: 'Coach unlinked from enterprise successfully',
    });
  } catch (error) {
    console.error('Error in unlink coach from enterprise:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
