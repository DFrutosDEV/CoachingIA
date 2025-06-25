import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';

// GET /api/coach - Obtener clientes de un coach
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    
    if (!coachId) {
      return NextResponse.json(
        { error: 'Coach ID es requerido' },
        { status: 400 }
      );
    }

    console.log('Buscando coach con ID:', coachId);

    // Buscar el coach y poblar sus clientes
    const coach = await Profile.findOne({user: coachId})
      .populate({
        path: 'clients',
        match: { isDeleted: false },
        populate: {
          path: 'user',
          select: 'name lastName email phone active isDeleted createdAt'
        }
      });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    console.log('Coach encontrado:', {
      id: coach._id,
      userId: coach.user,
      clientsCount: coach.clients?.length || 0,
      clients: coach.clients
    });

    // Verificar si hay clientes
    if (!coach.clients || coach.clients.length === 0) {
      return NextResponse.json({
        success: true,
        clients: [],
        message: 'No hay clientes asignados a este coach'
      });
    }

    // Transformar los datos para que coincidan con la estructura esperada en el frontend
    const clients = coach.clients.map((clientProfile: any) => {
      const clientUser = clientProfile.user;
      return {
        id: clientUser._id.toString(),
        name: `${clientUser.name} ${clientUser.lastName}`,
        email: clientUser.email,
        phone: clientUser.phone || 'No especificado',
        startDate: new Date(clientUser.createdAt).toLocaleDateString('es-ES'),
        //TODO: Calcular la cantidad de "Meet" que tiene asociadas al cliente en estado "fullfilled"
        sessions: Math.floor(Math.random() * 15) + 1, // Temporal - deberías tener un modelo Session
        //TODO: Calcular la fecha de la próxima sesión obteniendo la Meet mayor y mas cercana a hoy
        nextSession: 'Por programar', // Temporal - deberías tener un modelo Session
        progress: Math.floor(Math.random() * 100), // Temporal - deberías calcular el progreso real
        status: clientUser.active ? 'active' : 'inactive',
        focus: 'Desarrollo personal', // Temporal - deberías tener esto en el modelo
        avatar: clientProfile.profilePicture || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(clientUser.name + ' ' + clientUser.lastName)}`,
        bio: clientProfile.bio || 'Sin información biográfica disponible',
        goals: [], // Temporal - deberías tener un modelo Goal
        upcomingSessions: [], // Temporal - deberías tener un modelo Session
        notes: [] // Temporal - deberías tener un modelo Note
      };
    });

    console.log('Clientes transformados:', clients.length);

    return NextResponse.json({
      success: true,
      clients
    });

  } catch (error) {
    console.error('Error al obtener clientes del coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/coach - Asignar un cliente a un coach
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { coachId, clientId } = await request.json();
    
    if (!coachId || !clientId) {
      return NextResponse.json(
        { error: 'Coach ID y Client ID son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que ambos usuarios existen
    const coachUser = await User.findById(coachId);
    const clientUser = await User.findById(clientId);
    
    if (!coachUser || !clientUser) {
      return NextResponse.json(
        { error: 'Coach o cliente no encontrado' },
        { status: 404 }
      );
    }

    // Buscar los perfiles correspondientes
    const coachProfile = await Profile.findOne({ user: coachId });
    const clientProfile = await Profile.findOne({ user: clientId });

    if (!coachProfile || !clientProfile) {
      return NextResponse.json(
        { error: 'Perfil de coach o cliente no encontrado' },
        { status: 404 }
      );
    }

    // Agregar cliente al coach si no está ya asignado
    if (!coachProfile.clients.includes(clientProfile._id)) {
      coachProfile.clients.push(clientProfile._id);
      await coachProfile.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente asignado al coach correctamente'
    });

  } catch (error) {
    console.error('Error al asignar cliente al coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
