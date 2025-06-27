import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Role from '@/models/Role';

// GET /api/users/check-email - Verificar si existe un usuario por email (solo clientes)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email es requerido' 
        },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const usuario = await User.findOne({ 
      email: email.toLowerCase(),
      active: true,
      isDeleted: { $ne: true }
    }).select('_id name lastName email phone age');

    if (!usuario) {
      return NextResponse.json({
        success: true,
        exists: false,
        user: null
      });
    }

    const role = await Role.findOne({
      code: '3',
      active: true,
      isDeleted: { $ne: true }
    });

    // Buscar el perfil del usuario que sea de tipo cliente
    const perfil = await Profile.findOne({
      user: usuario._id,
      role: role._id,
      isDeleted: { $ne: true }
    }).populate({
      path: 'role',
      match: { 
        code: '3', // Código para rol de cliente
        active: true 
      }
    });

    // Verificar si el usuario tiene perfil de cliente
    if (perfil && perfil.role) {
      return NextResponse.json({
        success: true,
        exists: true,
        user: {
          _id: usuario._id,
          clientId: perfil._id,
          name: usuario.name,
          lastName: usuario.lastName,
          email: usuario.email,
          phone: usuario.phone,
          age: usuario.age
        }
      });
    } else {
      // El usuario existe pero no es cliente
      return NextResponse.json({
        success: false,
        exists: true,
        message: "Este email ya está registrado por favor ingrese otro email",
        error: "EMAIL_NOT_AVAILABLE"
      });
    }
    
  } catch (error) {
    console.error('Error verificando email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 