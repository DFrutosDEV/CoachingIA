import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Meet from '@/models/Meet';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';
import { fromZonedTime } from 'date-fns-tz';
import {
  formatUtcDate,
  formatUtcTime,
  getDateConfig,
  normalizeLocale,
} from '@/utils/date-formatter';

function getDateKeyInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getUtcDayRange(date: Date, timezone: string) {
  const localDateKey = getDateKeyInTimezone(date, timezone);
  const nextLocalDate = new Date(`${localDateKey}T00:00:00.000Z`);
  nextLocalDate.setUTCDate(nextLocalDate.getUTCDate() + 1);

  const nextLocalDateKey = nextLocalDate.toISOString().slice(0, 10);

  return {
    start: fromZonedTime(`${localDateKey}T00:00:00`, timezone),
    end: fromZonedTime(`${nextLocalDateKey}T00:00:00`, timezone),
  };
}

// GET /api/coach/getBasicData - Obtener datos básicos del dashboard del coach
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const locale = normalizeLocale(searchParams.get('locale'));
    const { timeZone: defaultTimeZone } = getDateConfig(locale);
    const timezone =
      request.headers.get('x-timezone') ||
      searchParams.get('timezone') ||
      defaultTimeZone;

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
    const coachProfile = await Profile.findOne({
      user: coachId,
      isDeleted: false,
    });
    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Perfil del coach no encontrado' },
        { status: 404 }
      );
    }

    // Obtener clientes del coach con sus datos de usuario
    const coachProfileWithClients = await Profile.findById(
      coachProfile._id
    ).populate({
      path: 'clients',
      match: { isDeleted: false },
      populate: {
        path: 'user',
        select: 'name lastName email phone active isDeleted createdAt',
      },
    });

    // Obtener la próxima sesión (próxima Meet no cancelada)
    const nextSession = await Meet.findOne({
      coachId: coachProfile._id, // Usar profileId del coach
      isCancelled: false,
      date: { $gte: new Date() },
    })
      .populate({
        path: 'clientId',
        model: Profile,
        populate: {
          path: 'user',
          model: User,
          select: 'name lastName email phone active isDeleted createdAt',
        },
      })
      .populate({
        path: 'objectiveId',
        model: Objective,
        select: 'title',
      })
      .sort({ date: 1, time: 1 })
      .limit(1);

    // Contar clientes activos
    const activeClientsCount = coachProfileWithClients.clients.length;

    // Contar sesiones programadas para esta semana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    const scheduledSessionsCount = await Meet.countDocuments({
      coachId: coachProfile._id, // Usar profileId del coach
      isCancelled: false,
      date: { $gte: startOfWeek, $lt: endOfWeek },
    });

    // Obtener sesiones de hoy en la zona horaria del usuario.
    const todayRange = getUtcDayRange(new Date(), timezone);

    const todaySessions = await Meet.find({
      coachId: coachProfile._id, // Usar profileId del coach
      isCancelled: false,
      date: { $gte: todayRange.start, $lt: todayRange.end },
    })
      .populate({
        path: 'clientId',
        populate: {
          path: 'user',
          select: 'name lastName',
        },
      })
      .populate('objectiveId', 'title')
      .sort({ time: 1 });

    // Obtener clientes recientes con su progreso
    const recentClients = await Promise.all(
      coachProfileWithClients.clients
        .slice(0, 5)
        .map(async (clientProfile: any) => {
          // Contar sesiones del cliente
          const sessionsCount = await Meet.countDocuments({
            clientId: clientProfile._id, // Usar profileId del cliente
            coachId: coachProfile._id, // Usar profileId del coach
            isCancelled: false,
          });

          // Calcular progreso basado en objetivos completados
          const totalObjectives = await Objective.countDocuments({
            clientId: clientProfile._id, // Usar profileId del cliente
            coachId: coachProfile._id, // Usar profileId del coach
          });

          const completedObjectives = await Objective.countDocuments({
            clientId: clientProfile._id, // Usar profileId del cliente
            coachId: coachProfile._id, // Usar profileId del coach
            isCompleted: true,
          });

          const progress =
            totalObjectives > 0
              ? Math.round((completedObjectives / totalObjectives) * 100)
              : 0;

          return {
            id: clientProfile._id.toString(),
            name: `${clientProfile.name} ${clientProfile.lastName}`,
            sessions: sessionsCount,
            progress: progress,
          };
        })
    );

    // Transformar las sesiones de hoy al formato esperado
    const formattedTodaySessions = todaySessions.map(session => ({
      time: `${formatUtcDate(session.date, {
        locale,
        timeZone: timezone,
        format: 'short',
      })} - ${formatUtcTime(session.date, {
        locale,
        timeZone: timezone,
        format: 'time-24',
      })}`,
      client: `${session.clientId.name} ${session.clientId.lastName}`,
      topic: session.objectiveId?.title || 'Sin objetivo definido',
    }));

    // Formatear la próxima sesión
    const formattedNextSession = nextSession
      ? {
        date: nextSession.date,
        link: nextSession.link,
        time: formatUtcTime(nextSession.date, {
          locale,
          timeZone: timezone,
          format: 'time-24',
        }),
        client: `${nextSession.clientId.name} ${nextSession.clientId.lastName}`,
        topic: nextSession.objectiveId?.title || 'Sin objetivo definido',
      }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        nextSession: formattedNextSession,
        activeClientsCount,
        scheduledSessionsCount,
        todaySessions: formattedTodaySessions,
        recentClients,
        points: coachProfile.points || 0,
      },
    });
  } catch (error) {
    console.error('Error al obtener datos básicos del coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
