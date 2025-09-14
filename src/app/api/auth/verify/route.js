import { NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth-jwt';
import User from '@/models/User';
import Profile from '@/models/Profile';
import mongoose from 'mongoose';
import Enterprise from '@/models/Enterprise';
import Role from '@/models/Role';

// Conectar a MongoDB
async function connectMongoDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coachingia');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();
    
    // Extraer token del header Authorization
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token no proporcionado' 
        },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido o expirado' 
        },
        { status: 401 }
      );
    }
    // Buscar usuario actual
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || user.isDeleted) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuario no encontrado o inactivo' 
        },
        { status: 401 }
      );
    }

    // Buscar perfil con rol y empresa
    const profile = await Profile.findOne({ user: user._id })
      .populate({
        path: 'role',
        model: Role,
        select: 'name code',
        match: { active: true }
      })
      .populate({
        path: 'enterprise',
        model: Enterprise,
        select: 'name logo address phone email website socialMedia',
        match: { isDeleted: false }
      });

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          name: profile.name,
          lastName: profile.lastName,
          email: user.email,
          age: profile.age,
          role: profile?.role,
          profile: profile,
          enterprise: profile?.enterprise || null,
          roles: profile?.role ? [profile.role.name.toLowerCase()] : []
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
