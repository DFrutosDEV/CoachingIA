import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import Profile from '@/models/Profile';

// GET /api/notification - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType'); // 'client', 'coach', 'admin', 'enterprise'

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId es requerido',
        },
        { status: 400 }
      );
    }

    // Buscar notificaciones donde el usuario es destinatario
    const notifications = await Notification.find({
      userIdRecipients: userId,
    })
      .populate('userIdSender', 'name email')
      .populate('userIdRecipients', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Contar notificaciones no leídas (donde el usuario no está en userIdRead)
    const unreadCount = await Notification.countDocuments({
      userIdRecipients: userId,
      userIdRead: { $ne: userId },
    });

    // Procesar las notificaciones para agregar el campo "read" calculado
    const processedNotifications = notifications.map(notification => {
      const isRead = notification.userIdRead.includes(userId);
      return {
        ...notification.toObject(),
        read: isRead,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications: processedNotifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error('Error obteniendo notificaciones:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// POST /api/notification - Crear notificación
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { massNotification, title, description, profileId, recipients } =
      body;

    // Validaciones básicas
    if (!title || !description || !profileId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Título, descripción y profileId son requeridos',
        },
        { status: 400 }
      );
    }

    // Verificar que haya algún tipo de destinatario
    const hasMassNotification =
      massNotification && Object.values(massNotification).some(Boolean);
    const hasIndividualRecipients = recipients && recipients.length > 0;

    if (!hasMassNotification && !hasIndividualRecipients) {
      return NextResponse.json(
        {
          success: false,
          error: 'Debe seleccionar al menos un destinatario',
        },
        { status: 400 }
      );
    }

    let recipientIds: string[] = [];

    if (massNotification.allClients) {
      // Obtener todos los clientes del coach
      const coachProfile =
        await Profile.findById(profileId).populate('clients');
      if (coachProfile && coachProfile.clients) {
        recipientIds = coachProfile.clients.map((client: any) => client._id);
      }
    } else if (massNotification.allCoaches) {
      // Obtener todos los coaches
      const coaches = await Profile.find({ 'role.name': 'coach' }).select(
        '_id'
      );
      recipientIds = coaches.map(coach => coach._id);
    } else if (massNotification.allUsers) {
      // Obtener todos los usuarios (clientes)
      const users = await Profile.find({ 'role.name': 'client' }).select('_id');
      recipientIds = users.map(user => user._id);
    } else if (recipients && recipients.length > 0) {
      // Usar los destinatarios seleccionados individualmente
      recipientIds = recipients;
    }

    if (recipientIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se encontraron destinatarios válidos',
        },
        { status: 400 }
      );
    }

    const notification = new Notification({
      title,
      description,
      createdAt: new Date(),
      userIdRead: [],
      userIdRecipients: recipientIds,
      userIdSender: profileId,
    });

    await notification.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Notificación creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creando notificación:', error);

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

// PATCH /api/notification - Marcar notificación como leída
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { notificationId, userId } = body;

    if (!notificationId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'notificationId y userId son requeridos',
        },
        { status: 400 }
      );
    }

    // Agregar el userId a la lista de userIdRead
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { userIdRead: userId } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notificación no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notificación marcada como leída',
    });
  } catch (error: any) {
    console.error('Error marcando notificación como leída:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// PUT /api/notification - Marcar todas las notificaciones como leídas
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId es requerido',
        },
        { status: 400 }
      );
    }

    // Buscar todas las notificaciones donde el usuario es destinatario y no las ha leído
    const result = await Notification.updateMany(
      {
        userIdRecipients: userId,
        userIdRead: { $ne: userId },
      },
      { $addToSet: { userIdRead: userId } }
    );

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
      },
      message: `${result.modifiedCount} notificación(es) marcada(s) como leída(s)`,
    });
  } catch (error: any) {
    console.error('Error marcando notificaciones como leídas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
