import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Objective from '@/models/Objective';
import Meet from '@/models/Meet';

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

    // Verificar que el coach existe y obtener su perfil
    const coach = await User.findById(coachId);
    if (!coach) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el perfil del coach
    const coachProfile = await Profile.findOne({ user: coachId, isDeleted: false });
    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Perfil del coach no encontrado' },
        { status: 404 }
      );
    }

    // Obtener clientes del coach con sus datos de usuario
    const coachProfileWithClients = await Profile.findById(coachProfile._id)
      .populate({
        path: 'clients',
        match: { isDeleted: false },
        populate: {
          path: 'user',
          select: 'name lastName email phone active isDeleted createdAt'
        }
      });

    // Verificar si hay clientes
    if (!coachProfileWithClients.clients || coachProfileWithClients.clients.length === 0) {
      return NextResponse.json({
        success: true,
        clients: [],
        message: 'No hay clientes asignados a este coach'
      });
    }

    // Transformar los datos para que coincidan con la estructura esperada en el frontend
    const clients = await Promise.all(coachProfileWithClients.clients.map(async (clientProfile: any) => {
      const clientUser = clientProfile.user;
      
      // Buscar el objetivo activo del cliente
      const activeObjective = await Objective.findOne({ 
        clientId: clientProfile._id, 
        active: true,
        isDeleted: false 
      });

      // Buscar sesiones completadas (meets que ya pasaron y no están canceladas)
      const completedSessions = await Meet.countDocuments({
        clientId: clientProfile._id, 
        coachId: coachProfile._id, 
        date: { $lt: new Date() }, // Sesiones que ya pasaron
        isCancelled: false
      });

      // Buscar la próxima sesión (meet más cercana a hoy que no esté cancelada)
      const nextSession = await Meet.findOne({
        clientId: clientProfile._id, 
        coachId: coachProfile._id, 
        date: { $gte: new Date() }, // Sesiones futuras o de hoy
        isCancelled: false
      }).sort({ date: 1, time: 1 }); // Ordenar por fecha y hora ascendente

      // Buscar la última sesión (meet más reciente que ya pasó y no está cancelada)
      const lastSession = await Meet.findOne({
        clientId: clientProfile._id, 
        coachId: coachProfile._id, 
        date: { $lt: new Date() }, // Sesiones que ya pasaron
        isCancelled: false
      }).sort({ date: -1, time: -1 }); // Ordenar por fecha y hora descendente

      return {
        id: clientUser._id.toString(),
        name: `${clientUser.name} ${clientUser.lastName}`,
        email: clientUser.email,
        phone: clientUser.phone || 'No especificado',
        startDate: new Date(clientUser.createdAt).toLocaleDateString('es-ES'),
        sessions: completedSessions,
        nextSession: nextSession ? {
          date: nextSession.date,
          time: nextSession.time,
          link: nextSession.link,
          objectiveId: nextSession.objectiveId.toString()
        } : {},
        lastSession: lastSession ? {
          date: lastSession.date,
          time: lastSession.time,
          link: lastSession.link,
          objectiveId: lastSession.objectiveId.toString()
        } : {},
        progress: Math.floor(Math.random() * 100), // Temporal - deberías calcular el progreso real
        status: clientUser.active ? 'active' : 'inactive',
        focus: activeObjective?.title || 'Sin objetivo',
        avatar: clientProfile.profilePicture || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(clientUser.name + ' ' + clientUser.lastName)}`,
        bio: clientProfile.bio || 'Sin información',
        goals: [], // Temporal - deberías tener un modelo Goal
        upcomingSessions: [], // Temporal - deberías tener un modelo Session
        notes: [], // Temporal - deberías tener un modelo Note
        activeObjectiveId: activeObjective?._id?.toString() || null
      };
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
    const coachUser = await User.findById(coachId);
    const clientUser = await User.findById(clientId);
    
    if (!coachUser || !clientUser) {
      return NextResponse.json(
        { error: 'Coach o cliente no encontrado' },
        { status: 404 }
      );
    }

    // Buscar los perfiles correspondientes
    const coachProfile = await Profile.findOne({ user: coachId, isDeleted: false });
    const clientProfile = await Profile.findOne({ user: clientId, isDeleted: false });

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
