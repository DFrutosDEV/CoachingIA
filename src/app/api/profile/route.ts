import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import User from '@/models/User';

// GET /api/profile - Obtener perfil del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de usuario requerido' 
        },
        { status: 400 }
      );
    }
    
    const profile = await Profile.findOne({ 
      user: userId, 
      isDeleted: { $ne: true } 
    }).populate('user', 'email');
    
    if (!profile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Perfil no encontrado' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: profile
    });
    
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// POST /api/profile - Crear o actualizar perfil
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const lastName = formData.get('lastName') as string;
    const age = formData.get('age') as string;
    const phone = formData.get('phone') as string;
    const bio = formData.get('bio') as string;
    const address = formData.get('address') as string;
    const profilePicture = formData.get('profilePicture') as File;
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de usuario requerido' 
        },
        { status: 400 }
      );
    }

    // Validar campos requeridos
    if (!name || !lastName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre y apellido son requeridos' 
        },
        { status: 400 }
      );
    }
    
    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }
    
    let profilePictureBase64 = '';
    
    // Procesar la imagen si se proporcionó
    if (profilePicture && profilePicture.size > 0) {
      // Validar tamaño (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (profilePicture.size > maxSize) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'La imagen no puede pesar más de 10MB' 
          },
          { status: 400 }
        );
      }
      
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(profilePicture.type)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Solo se permiten archivos JPG, PNG y WebP' 
          },
          { status: 400 }
        );
      }
      
      // Convertir imagen a base64
      const bytes = await profilePicture.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      
      // Crear data URL con el tipo MIME correcto
      profilePictureBase64 = `data:${profilePicture.type};base64,${base64String}`;
    }
    
    // Buscar perfil existente o crear uno nuevo
    let profile = await Profile.findOne({ user: userId });
    
    if (profile) {
      // Actualizar perfil existente
      const updateData: any = {
        name: name,
        lastName: lastName,
        age: age ? parseInt(age) : profile.age,
        phone: phone || profile.phone,
        bio: bio || profile.bio,
        address: address || profile.address
      };
      
      // Solo actualizar la imagen si se proporcionó una nueva
      if (profilePictureBase64) {
        updateData.profilePicture = profilePictureBase64;
      }
      
      profile = await Profile.findByIdAndUpdate(
        profile._id,
        updateData,
        { new: true }
      ).populate('user', 'email');
    } else {
      // Crear nuevo perfil
      profile = new Profile({
        user: userId,
        role: user.roles?.[0] || null, // Asignar el primer rol del usuario
        name: name,
        lastName: lastName,
        age: age ? parseInt(age) : undefined,
        phone: phone || '',
        bio: bio || '',
        address: address || '',
        profilePicture: profilePictureBase64,
        indexDashboard: [],
        clients: [],
        enterprise: null
      });
      
      await profile.save();
      profile = await profile.populate('user', 'email');
    }
    
    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Perfil actualizado exitosamente'
    });
    
  } catch (error: any) {
    console.error('Error guardando perfil:', error);
    
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

// PUT /api/profile - Actualizar perfil (método alternativo)
export async function PUT(request: NextRequest) {
  return POST(request);
}
