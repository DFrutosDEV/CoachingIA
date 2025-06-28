import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import Role from '@/models/Role';
import Profile from '@/models/Profile';
import Enterprise from '@/models/Enterprise';

// Conectar a MongoDB
async function connectMongoDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tu_base_de_datos');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    // Conectar a la base de datos
    await connectMongoDB();
    
    // Obtener datos del cuerpo de la petición
    const { email, contrasena } = await request.json();
    
    // Validar que se proporcionen email y contraseña
    if (!email || !contrasena) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email y contraseña son requeridos' 
        },
        { status: 400 }
      );
    }
    
    console.log('🔍 Intentando login con:', { email, password: contrasena });
    
    // Buscar usuario por email y contraseña (usando el campo correcto 'password')
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      password: contrasena,
      active: true
    });
    
    console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciales inválidas' 
        },
        { status: 401 }
      );
    }

    // Devuelve el perfil del usuario con el rol activo y la empresa asociada activa y no eliminada
    const profile = await Profile.findOne({ user: user._id })
    .populate({
      path: 'role',
      select: 'name code',
      match: { active: true }
    })
    .populate({
      path: 'enterprise',
      model: Enterprise,
      select: 'name logo address phone email website socialMedia',
      match: { active: true, isDeleted: false }
    });
    
    // Login exitoso - retornar datos del usuario
    const userResponse = {
      _id: user._id,
      role: profile.role,
      profile: profile,
      enterprise: profile?.enterprise || null,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      roles: [profile.role.name.toLowerCase()],
      age: user.age,
    };
    
    console.log('✅ Login exitoso para:', email);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Login exitoso',
        user: userResponse
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: error.message
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar que el endpoint está funcionando
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Endpoint de login funcionando correctamente',
      metodo: 'Usa POST para hacer login con email y contraseña'
    },
    { status: 200 }
  );
}
