import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth-jwt';
import User from '@/models/User';
import Role from '@/models/Role';
import Profile from '@/models/Profile';
import Enterprise from '@/models/Enterprise';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    // Conectar a la base de datos usando la configuración centralizada
    await connectDB();
    
    // Verificar que la conexión esté realmente activa
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB no está conectado. Estado:', mongoose.connection.readyState);
      return NextResponse.json(
        {
          success: false,
          message: 'Error de conexión a la base de datos',
        },
        { status: 503 }
      );
    }

    // Hacer una consulta de prueba para verificar que la base de datos responde
    try {
      await mongoose.connection.db.admin().ping();
      console.log('✅ Ping a MongoDB exitoso');
      console.log('📊 Base de datos:', {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      });
    } catch (pingError) {
      console.error('❌ Error haciendo ping a MongoDB:', pingError);
      return NextResponse.json(
        {
          success: false,
          message: 'Error de conexión a la base de datos',
        },
        { status: 503 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const { email, password } = await request.json();
    console.log('🔍 Datos recibidos:', { email, password });
    // Validar que se proporcionen email y contraseña
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email y contraseña son requeridos',
        },
        { status: 400 }
      );
    }

    console.log('🔍 Intentando login con:', { email, password });

    // Buscar usuario por email y contraseña (usando el campo correcto 'password')
    let user;
    try {
      user = await User.findOne({
        email: email.toLowerCase(),
        password: password,
        isDeleted: false,
      });
    } catch (dbError) {
      console.error('❌ Error consultando base de datos:', dbError);
      return NextResponse.json(
        {
          success: false,
          message: 'Error de conexión a la base de datos',
        },
        { status: 503 }
      );
    }

    console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
    if (user) {
      console.log('👤 Usuario encontrado - ID:', user._id);
    } else {
      console.log('❌ No se encontró usuario con esas credenciales');
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Primero obtener el perfil para extraer el rol
    const profile = await Profile.findOne({ user: user._id })
      .populate({
        path: 'role',
        model: Role,
        select: 'name code',
        match: { active: true },
      })
      .populate({
        path: 'enterprise',
        model: Enterprise,
        select: 'name logo address phone email website socialMedia',
        match: { active: true, isDeleted: false },
      });

    // Verificar que el perfil tenga un rol válido
    if (!profile || !profile.role) {
      return NextResponse.json(
        {
          success: false,
          message: 'User without valid profile or role',
        },
        { status: 401 }
      );
    }

    // Generar token JWT con el rol del perfil
    const token = generateToken(
      {
        userId: user._id,
        email: user.email,
        role: profile.role.name.toLowerCase(),
      },
      '6h'
    );
    console.log('🔑 Token generado exitosamente');

    // Login exitoso - retornar datos del usuario
    const userResponse = {
      _id: user._id,
      role: profile.role,
      profile: profile,
      enterprise: profile?.enterprise || null,
      name: profile.name,
      lastName: profile.lastName,
      email: user.email,
      roles: [profile.role.name.toLowerCase()],
      age: profile.age,
    };

    console.log('✅ Login exitoso para:', email);

    return NextResponse.json(
      {
        success: true,
        message: 'Login exitoso',
        user: userResponse,
        token: token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
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
      metodo: 'Usa POST para hacer login con email y contraseña',
    },
    { status: 200 }
  );
}
