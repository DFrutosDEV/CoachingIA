import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../models/User';

// Conectar a MongoDB
async function connectMongoDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tu_base_de_datos');
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
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
    
    // Buscar usuario por email y contraseña
    const usuario = await User.findOne({ 
      email: email.toLowerCase(),
      contrasena: contrasena,
      activo: true // Solo usuarios activos pueden loguearse
    });
    
    if (!usuario) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciales inválidas' 
        },
        { status: 401 }
      );
    }
    
    // Login exitoso - retornar datos del usuario (sin contraseña)
    const usuarioResponse = {
      id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      edad: usuario.edad,
      fechaCreacion: usuario.fechaCreacion,
      activo: usuario.activo
    };
    
    return NextResponse.json(
      {
        success: true,
        message: 'Login exitoso',
        usuario: usuarioResponse
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor' 
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
