import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/profile/change-password - Cambiar contraseña del usuario
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error:
            'ID de usuario, contraseña actual y nueva contraseña son requeridos',
        },
        { status: 400 }
      );
    }

    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'La nueva contraseña debe tener al menos 6 caracteres',
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
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      );
    }

    // Verificar que la contraseña actual sea correcta
    if (user.password !== currentPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'La contraseña actual es incorrecta',
        },
        { status: 400 }
      );
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'La nueva contraseña debe ser diferente a la actual',
        },
        { status: 400 }
      );
    }

    // Actualizar la contraseña
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error: any) {
    console.error('Error cambiando contraseña:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
