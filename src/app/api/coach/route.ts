import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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

    // Buscar el coach y poblar sus clientes
    const coach = await User.findById(coachId)
      .populate({
        path: 'clients',
        match: { isDeleted: false, active: true },
        select: 'name lastName email phone biography profilePicture creationDate'
      });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    // Transformar los datos para que coincidan con la estructura esperada en el frontend
    const clients = coach.clients.map((client: any) => ({
      id: client._id.toString(),
      name: `${client.name} ${client.lastName}`,
      email: client.email,
      phone: client.phone || 'No especificado',
      startDate: new Date(client.creationDate).toLocaleDateString('es-ES'),
      //TODO: Calcular la cantidad de "Meet" que tiene asociadas al cliente en estado "fullfilled"
      sessions: Math.floor(Math.random() * 15) + 1, // Temporal - deberías tener un modelo Session
      //TODO: Calcular la fecha de la próxima sesión obteniendo la Meet mayor y mas cercana a hoy
      nextSession: 'Por programar', // Temporal - deberías tener un modelo Session
      progress: Math.floor(Math.random() * 100), // Temporal - deberías calcular el progreso real
      status: client.active ? 'active' : 'inactive',
      focus: 'Desarrollo personal', // Temporal - deberías tener esto en el modelo
      avatar: client.profilePicture || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(client.name + ' ' + client.lastName)}`,
      bio: client.biography || 'Sin información biográfica disponible',
      goals: [], // Temporal - deberías tener un modelo Goal
      upcomingSessions: [], // Temporal - deberías tener un modelo Session
      notes: [] // Temporal - deberías tener un modelo Note
    }));

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
    const coach = await User.findById(coachId);
    const client = await User.findById(clientId);
    
    if (!coach || !client) {
      return NextResponse.json(
        { error: 'Coach o cliente no encontrado' },
        { status: 404 }
      );
    }

    // Agregar cliente al coach si no está ya asignado
    if (!coach.clients.includes(clientId)) {
      coach.clients.push(clientId);
      await coach.save();
    }

    // Agregar coach al cliente si no está ya asignado
    if (!client.coaches.includes(coachId)) {
      client.coaches.push(coachId);
      await client.save();
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
