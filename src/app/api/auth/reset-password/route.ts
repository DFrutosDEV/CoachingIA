import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/services/email-service';

// Función para generar una contraseña aleatoria
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// POST /api/auth/reset-password - Resetear contraseña de usuario
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email es requerido',
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email inválido',
        },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, se enviará un correo con la nueva contraseña',
      });
    }

    // Generar nueva contraseña aleatoria
    const newPassword = generateRandomPassword(12);

    // Actualizar la contraseña del usuario
    user.password = newPassword;
    await user.save();

    // Enviar email con la nueva contraseña
    const emailResult = await sendPasswordResetEmail(user.email, newPassword);

    if (!emailResult.success) {
      console.error('Error enviando email de reset:', emailResult.error);
      // Aunque el email falle, la contraseña ya fue cambiada
      // Por seguridad, no revelamos el error al usuario
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, se enviará un correo con la nueva contraseña',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, se enviará un correo con la nueva contraseña',
    });
  } catch (error: any) {
    console.error('Error reseteando contraseña:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
