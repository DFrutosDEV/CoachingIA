import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users - Obtener todos los usuarios
export async function GET() {
  try {
    await connectDB();
    
    const usuarios = await User.find({ activo: true })
      .select('-__v')
      .sort({ fechaCreacion: -1 });
    
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