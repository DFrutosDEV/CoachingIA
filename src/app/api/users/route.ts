import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Role from '@/models/Role';
import { sendWelcomeEmail } from '@/lib/services/email-service';
import Enterprise from '@/models/Enterprise';

// GET /api/users - Obtener usuarios (con búsqueda opcional)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query: any = { isDeleted: { $ne: true } };

    // Si hay parámetro de búsqueda, buscar por nombre, apellido o email
    if (search && search.length >= 3) {
      const searchRegex = new RegExp(search, 'i'); // Búsqueda case-insensitive
      query.$or = [
        { name: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const profiles = await Profile.find(query)
      .populate('user', 'email')
      .populate('role', 'name code')
      .limit(limit)
      .sort({ name: 1, lastName: 1 });

    // Si hay búsqueda, devolver formato para select
    if (search) {
      const formattedUsers = profiles.map(profile => ({
        label: `${profile.name} ${profile.lastName}`,
        value: profile._id.toString(),
      }));

      return NextResponse.json({
        success: true,
        users: formattedUsers,
        total: formattedUsers.length,
      });
    }

    // Si no hay búsqueda, devolver formato completo
    return NextResponse.json({
      success: true,
      data: profiles,
      total: profiles.length,
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Crear un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, lastName, email, profile, enterpriseName, enterpriseId } = body;

    // Validaciones básicas
    if (!name || !lastName || !email || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, last name, email and profile are required',
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'There is already a user with this email',
        },
        { status: 409 }
      );
    }

    // Obtener el rol correspondiente al perfil
    const role = await Role.findOne({ code: profile });
    if (!role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not valid',
        },
        { status: 400 }
      );
    }

    // Si el perfil es empresa, crear una nueva empresa y guardar el ID de la empresa
    let empresaId: string | undefined;
    if (profile === '4') {
      if (!enterpriseName || typeof enterpriseName !== 'string' || !enterpriseName.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Enterprise name is required',
          },
          { status: 400 }
        );
      }

      const nuevaEmpresa = new Enterprise({
        name: enterpriseName.trim(),
        email: email,
      });

      const empresaGuardada = await nuevaEmpresa.save();
      empresaId = empresaGuardada._id.toString();
    }

    // Usar contraseña por defecto
    const defaultPassword = '!Password1';

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      email: email.toLowerCase(),
      password: defaultPassword,
      firstLogin: false,
      isDeleted: false,
    });

    const usuarioGuardado = await nuevoUsuario.save();

    // Crear perfil del usuario
    const nuevoPerfil = new Profile({
      user: usuarioGuardado._id,
      role: role._id,
      name,
      lastName,
      bio: '',
      phone: '',
      address: '',
      indexDashboard: [],
      clients: [],
      points: 0,
      ...(profile === '4' && empresaId ? { enterprise: empresaId } : enterpriseId ? { enterprise: enterpriseId } : { enterprise: null }),
    });

    const perfilGuardado = await nuevoPerfil.save();

    // Populate para devolver datos completos
    const perfilCompleto = await Profile.findById(perfilGuardado._id)
      .populate('user', 'email')
      .populate('role', 'name code');

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(email, name, defaultPassword);
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError);
      // No fallamos la creación del usuario si falla el email
    }

    return NextResponse.json(
      {
        success: true,
        data: perfilCompleto,
        message:
          'Usuario creado exitosamente. Se ha enviado un email con las credenciales.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creando usuario:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          details: errores,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
