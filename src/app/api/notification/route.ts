import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

// POST /api/notification - Crear notificación(es)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      recipients, // Array de IDs de destinatarios
      title, 
      message,
      userId // ID del usuario que envía (coach)
    } = body;
    
    // Validaciones básicas
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Se requiere al menos un destinatario' 
        },
        { status: 400 }
      );
    }
    
    if (!title || !message || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Título, mensaje y userId son requeridos' 
        },
        { status: 400 }
      );
    }
    
    // Crear notificaciones para cada destinatario
    const notificationsPromises = recipients.map(recipientId => {
      return new Notification({
        title: title,
        description: message,
        createdBy: userId,
        to: recipientId,
        read: false
      }).save();
    });
    
    // Guardar todas las notificaciones
    const savedNotifications = await Promise.all(notificationsPromises);
    
    return NextResponse.json({
      success: true,
      data: {
        notifications: savedNotifications,
        totalSent: savedNotifications.length
      },
      message: `${savedNotifications.length} notificación(es) enviada(s) exitosamente`
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creando notificaciones:', error);
    
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