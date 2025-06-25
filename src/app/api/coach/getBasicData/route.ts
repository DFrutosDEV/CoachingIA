import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Meet from '@/models/Meet';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';

// GET /api/coach/getBasicData - Obtener datos básicos del dashboard del coach
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

    // Verificar que el coach existe
    const coach = await User.findById(coachId);
    if (!coach) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el perfil del coach para acceder a sus clientes
    const coachProfile = await Profile.findOne({ user: coachId, isDeleted: false })
      .populate({
        path: 'clients',
        match: { isDeleted: false },
        populate: {
          path: 'user',
          select: 'name lastName email phone biography profilePicture'
        }
      });

    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Perfil del coach no encontrado' },
        { status: 404 }
      );
    }

    const clientIds = coachProfile.clients.map((client: any) => client.user._id);

    // Obtener la próxima sesión (próxima Meet no cancelada)
    const nextSession = await Meet.findOne({
      coachId: coachId,
      isCancelled: false,
      date: { $gte: new Date() }
    })
    .populate('clientId', 'name lastName')
    .populate('objectiveId', 'title')
    .sort({ date: 1, time: 1 })
    .limit(1);

    // Contar clientes activos
    const activeClientsCount = coachProfile.clients.length;

    // Contar sesiones programadas para esta semana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    const scheduledSessionsCount = await Meet.countDocuments({
      coachId: coachId,
      isCancelled: false,
      date: { $gte: startOfWeek, $lt: endOfWeek }
    });

    // Obtener sesiones de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = await Meet.find({
      coachId: coachId,
      isCancelled: false,
      date: { $gte: today, $lt: tomorrow }
    })
    .populate('clientId', 'name lastName')
    .populate('objectiveId', 'title')
    .sort({ time: 1 });

    // Obtener clientes recientes con su progreso
    const recentClients = await Promise.all(
      coachProfile.clients.slice(0, 5).map(async (clientProfile: any) => {
        const client = clientProfile.user;
        
        // Contar sesiones del cliente
        const sessionsCount = await Meet.countDocuments({
          clientId: client._id,
          coachId: coachId,
          isCancelled: false
        });

        // Calcular progreso basado en objetivos completados
        const totalObjectives = await Objective.countDocuments({
          clientId: client._id,
          coachId: coachId
        });

        const completedObjectives = await Objective.countDocuments({
          clientId: client._id,
          coachId: coachId,
          isCompleted: true
        });

        const progress = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

        return {
          id: client._id.toString(),
          name: `${client.name} ${client.lastName}`,
          sessions: sessionsCount,
          progress: progress
        };
      })
    );

    // Transformar las sesiones de hoy al formato esperado
    const formattedTodaySessions = todaySessions.map(session => ({
      time: `${session.time} - ${new Date(session.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      client: `${session.clientId.name} ${session.clientId.lastName}`,
      topic: session.objectiveId?.title || 'Sin objetivo definido'
    }));

    // Formatear la próxima sesión
    const formattedNextSession = nextSession ? {
      date: nextSession.date,
      link: nextSession.link,
      time: nextSession.time,
      client: `${nextSession.clientId.name} ${nextSession.clientId.lastName}`,
      topic: nextSession.objectiveId?.title || 'Sin objetivo definido'
    } : null;

    return NextResponse.json({
      success: true,
      data: {
        nextSession: formattedNextSession,
        activeClientsCount,
        scheduledSessionsCount,
        todaySessions: formattedTodaySessions,
        recentClients
      }
    });

  } catch (error) {
    console.error('Error al obtener datos básicos del coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 