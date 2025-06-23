import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users - Obtener usuarios (con búsqueda opcional)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let query: any = { active: true, isDeleted: { $ne: true } };
    
    // Si hay parámetro de búsqueda, buscar por nombre, apellido o email
    if (search && search.length >= 3) {
      const searchRegex = new RegExp(search, 'i'); // Búsqueda case-insensitive
      query.$or = [
        { name: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }
    
    const usuarios = await User.find(query)
      .select('_id name lastName email')
      .populate('roles', 'name')
      .limit(limit)
      .sort({ name: 1, lastName: 1 });
    
    // Si hay búsqueda, devolver formato para select
    if (search) {
      const formattedUsers = usuarios.map(user => ({
        label: `${user.name} ${user.lastName}`,
        value: user._id.toString()
      }));
      
      return NextResponse.json({
        success: true,
        users: formattedUsers,
        total: formattedUsers.length
      });
    }
    
    // Si no hay búsqueda, devolver formato completo
    return NextResponse.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
    
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
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
    const { nombre, email, edad } = body;
    
    // Validaciones básicas
    if (!nombre || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre y email son requeridos' 
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
          error: 'Ya existe un usuario con este email' 
        },
        { status: 409 }
      );
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      email: email.toLowerCase(),
      edad
    });
    
    const usuarioGuardado = await nuevoUsuario.save();
    
    return NextResponse.json({
      success: true,
      data: usuarioGuardado,
      message: 'Usuario creado exitosamente'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creando usuario:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error de validación',
          details: errores
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 