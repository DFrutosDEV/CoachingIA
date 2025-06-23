import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simulación de verificación de sesión (reemplazar con tu lógica real)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session-token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'No hay sesión activa' },
        { status: 401 }
      )
    }

    // Aquí deberías verificar el token con tu base de datos
    // Por ahora es una simulación
    try {
      // Simulación de decodificación del token
      const decoded = JSON.parse(atob(sessionToken))
      
      if (!decoded.userId || !decoded.exp || decoded.exp < Date.now()) {
        return NextResponse.json(
          { success: false, message: 'Sesión expirada' },
          { status: 401 }
        )
      }

      // Aquí buscarías el usuario en la base de datos
      // Por ahora devuelvo datos simulados
      const userData = {
        _id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        lastName: decoded.lastName,
        roles: decoded.roles || ['client']
      }

      return NextResponse.json({
        success: true,
        user: userData,
        message: 'Sesión recuperada exitosamente'
      })

    } catch (decodeError) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Error verificando sesión:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 