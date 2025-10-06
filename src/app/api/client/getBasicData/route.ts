import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Meet from '@/models/Meet';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';
import Goal from '@/models/Goal';
import { formatDate } from '@/utils/validatesInputs';

// GET /api/client/getBasicData - Obtener datos básicos del dashboard del cliente
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe y obtener su perfil
    const client = await User.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el perfil del cliente
    const clientProfile = await Profile.findOne({
      user: clientId,
      isDeleted: false,
    });
    if (!clientProfile) {
      return NextResponse.json(
        { error: 'Perfil del cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener la próxima sesión (próxima Meet no cancelada)
    const nextSession = await Meet.findOne({
      clientId: clientProfile._id,
      isCancelled: false,
      date: { $gte: new Date() },
    })
      .populate({
        path: 'coachId',
        model: Profile,
        populate: {
          path: 'user',
          model: User,
          select: 'email isDeleted createdAt',
        },
      })
      .populate({
        path: 'objectiveId',
        model: Objective,
        select: 'title',
      })
      .sort({ date: 1, time: 1 })
      .limit(1);

    // Contar sesiones completadas (meets que ya pasaron y no están canceladas)
    const completedSessions = await Meet.countDocuments({
      clientId: clientProfile._id,
      isCancelled: false,
      date: { $lt: new Date() },
    });

    // Contar sesiones completadas este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedSessionsThisMonth = await Meet.countDocuments({
      clientId: clientProfile._id,
      isCancelled: false,
      date: { $gte: startOfMonth, $lt: new Date() },
    });

    // Obtener objetivos del cliente
    const totalObjectives = await Objective.countDocuments({
      clientId: clientProfile._id,
    });

    const completedObjectives = await Objective.countDocuments({
      clientId: clientProfile._id,
      isCompleted: true,
    });

    // Obtener próximas sesiones (próximas 5 sesiones)
    const upcomingSessions = await Meet.find({
      clientId: clientProfile._id,
      isCancelled: false,
      date: { $gte: new Date() },
    })
      .populate({
        path: 'coachId',
        populate: {
          path: 'user',
          select: 'name lastName',
        },
      })
      .populate('objectiveId', 'title')
      .sort({ date: 1, time: 1 })
      .limit(5);

    // Obtener Goals del cliente para la card de objetivos
    const clientGoals = await Goal.find({
      clientId: clientProfile._id,
      isDeleted: false,
    })
      .populate({
        path: 'objectiveId',
        model: Objective,
        select: 'title',
      })
      .sort({ createdAt: -1 });

    // Obtener los últimos 5 Objectives del cliente para la card de progreso
    const clientObjectives = await Objective.find({
      clientId: clientProfile._id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calcular progreso de cada Objective basado en sus Goals
    const objectivesWithProgress = await Promise.all(
      clientObjectives.map(async objective => {
        const objectiveGoals = await Goal.find({
          objectiveId: objective._id,
          clientId: clientProfile._id,
          isDeleted: false,
        });

        const totalGoals = objectiveGoals.length;
        const completedGoals = objectiveGoals.filter(
          goal => goal.isCompleted
        ).length;
        const progress =
          totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

        return {
          title: objective.title,
          progress: Math.round(progress),
          totalGoals,
          completedGoals,
          hasGoals: totalGoals > 0,
        };
      })
    );

    // Transformar las próximas sesiones al formato esperado
    const formattedUpcomingSessions = upcomingSessions.map(session => ({
      date: `${formatDate(new Date(session.date), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })}, ${new Date(session.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      coach: `${session.coachId.name} ${session.coachId.lastName}`,
      topic: session.objectiveId?.title || 'Sin objetivo definido',
    }));

    // Formatear la próxima sesión
    const formattedNextSession = nextSession
      ? {
          date: nextSession.date,
          link: nextSession.link,
          time: new Date(nextSession.date).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          coach: `${nextSession.coachId.name} ${nextSession.coachId.lastName}`,
          topic: nextSession.objectiveId?.title || 'Sin objetivo definido',
        }
      : null;

    // Transformar los Goals al formato esperado para la card de progreso
    const goalsWithProgress = clientGoals.map(goal => ({
      goal: goal.description,
      progress: goal.isCompleted ? 100 : 0,
      objectiveTitle: goal.objectiveId?.title || 'Sin objetivo',
    }));

    // Transformar los Goals para la card de objetivos
    const formattedClientGoals = clientGoals.map(goal => ({
      description: goal.description,
      isCompleted: goal.isCompleted,
      objectiveTitle: goal.objectiveId?.title || 'Sin objetivo',
    }));

    return NextResponse.json({
      success: true,
      data: {
        nextSession: formattedNextSession,
        completedSessions,
        completedSessionsThisMonth,
        totalObjectives,
        completedObjectives,
        upcomingSessions: formattedUpcomingSessions,
        goalsWithProgress,
        clientGoals: formattedClientGoals,
        hasGoals: clientGoals.length > 0,
        objectivesWithProgress,
      },
    });
  } catch (error) {
    console.error('Error al obtener datos básicos del cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
