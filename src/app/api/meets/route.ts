import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meet from '@/models/Meet';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';
import User from '@/models/User';
import {
  DEFAULT_LOCALE,
  formatUtcDate,
  formatUtcTime,
  getTimeZoneForLocale,
  normalizeLocale,
} from '@/utils/date-formatter';
import { fromZonedTime } from 'date-fns-tz';
import { sendAppointmentConfirmationEmail } from '@/lib/services/email-service';
import { createIcsFile, IcsRecurrence } from '@/utils/ics-service';
import { generateJitsiLink } from '@/utils/generateJitsiLinks';

function getUtcMeetDate(date: string, time?: string, timezone?: string | null) {
  if (time && /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time)) {
    const utcDate = fromZonedTime(
      `${date}T${time}:00`,
      timezone || getTimeZoneForLocale(DEFAULT_LOCALE)
    );

    if (!Number.isNaN(utcDate.getTime())) {
      return utcDate;
    }
  }

  const fallbackDate = new Date(date);
  if (Number.isNaN(fallbackDate.getTime())) {
    throw new Error('INVALID_MEET_DATE');
  }

  return fallbackDate;
}

function getRecurrenceFromPeriodicity(
  periodicity: unknown,
  count: number
): IcsRecurrence | undefined {
  if (count <= 1 || typeof periodicity !== 'string') {
    return undefined;
  }

  switch (periodicity) {
    case 'daily':
      return { frequency: 'DAILY', count };
    case 'weekly':
      return { frequency: 'WEEKLY', count };
    case 'biweekly':
      return { frequency: 'WEEKLY', interval: 2, count };
    case 'monthly':
      return { frequency: 'MONTHLY', count };
    default:
      return undefined;
  }
}

// POST /api/meets - Crear multiples meets para un cliente
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { clientId, coachId, objectiveId, meets, periodicity } =
      await request.json();
    const locale = normalizeLocale(request.headers.get('x-locale'));
    const timezone =
      request.headers.get('x-timezone') || getTimeZoneForLocale(locale);

    if (
      !clientId ||
      !coachId ||
      !objectiveId ||
      !meets ||
      !Array.isArray(meets) ||
      meets.length === 0
    ) {
      return NextResponse.json(
        { error: 'clientId, coachId, objectiveId y meets son requeridos' },
        { status: 400 }
      );
    }

    const recurrence = getRecurrenceFromPeriodicity(periodicity, meets.length);
    let preparedMeets: Array<{ date: Date }>;
    try {
      preparedMeets = meets.map((meet: any) => ({
        date: getUtcMeetDate(meet.date, meet.time, timezone),
      }));
    } catch {
      return NextResponse.json(
        { error: 'One or more sessions have an invalid date or time' },
        { status: 400 }
      );
    }
    const seriesLink = recurrence
      ? generateJitsiLink(preparedMeets[0].date, clientId, coachId)
      : null;

    // Crear los meets en la base de datos
    const meetsToCreate = preparedMeets.map(meet => {
      const link = seriesLink || generateJitsiLink(meet.date, clientId, coachId);

      return {
        date: meet.date,
        link,
        createdBy: coachId,
        clientId,
        coachId,
        objectiveId,
        isCancelled: false,
      };
    });

    const createdMeets = await Meet.insertMany(meetsToCreate);

    try {
      const [clientProfile, coachProfile, objective] = await Promise.all([
        Profile.findById(clientId),
        Profile.findById(coachId),
        Objective.findById(objectiveId).select('title'),
      ]);

      if (clientProfile && coachProfile && createdMeets.length > 0) {
        const [clientUser, coachUser] = await Promise.all([
          User.findById(clientProfile.user).select('email'),
          User.findById(coachProfile.user).select('email'),
        ]);
        const firstMeet = createdMeets[0];
        const clientName = `${clientProfile.name} ${clientProfile.lastName}`.trim();
        const coachName = `${coachProfile.name} ${coachProfile.lastName}`.trim();
        const objectiveTitle = objective?.title || '';
        const icsFile = await createIcsFile({
          title: `${objectiveTitle} - ${coachName}`,
          startDate: firstMeet.date,
          durationMinutes: 60,
          description: `Objetivo: ${objectiveTitle}`,
          location: 'Videoconsulta',
          meetingUrl: firstMeet.link,
          organizer: coachUser?.email
            ? { email: coachUser.email, name: coachName }
            : undefined,
          attendees: [
            clientUser?.email ? { email: clientUser.email, name: clientName } : null,
            coachUser?.email ? { email: coachUser.email, name: coachName } : null,
          ].filter(
            (attendee): attendee is { email: string; name: string } => Boolean(attendee)
          ),
          recurrence,
          fileNamePrefix: recurrence ? 'sesiones-coaching' : 'sesion-coaching',
        });

        await sendAppointmentConfirmationEmail({
          recipients: [
            clientUser?.email ? { email: clientUser.email, name: clientName } : null,
            coachUser?.email ? { email: coachUser.email, name: coachName } : null,
          ].filter(
            (recipient): recipient is { email: string; name: string } => Boolean(recipient)
          ),
          appointmentDate: formatUtcDate(firstMeet.date, {
            locale,
            timeZone: timezone,
            format: 'long',
          }),
          appointmentTime: formatUtcTime(firstMeet.date, {
            locale,
            timeZone: timezone,
            format: 'time-24',
          }),
          coachName,
          appointmentDuration: '60',
          meetingLink: firstMeet.link,
          icsAttachment: icsFile,
        });
      }
    } catch (emailError) {
      console.error('Error sending session confirmation:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: `${createdMeets.length} reuniones creadas correctamente`,
      meets: createdMeets,
    });
  } catch (error) {
    console.error('Error al crear meets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/meets - Obtener sesiones con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objectiveId');
    const clientId = searchParams.get('clientId');
    const coachId = searchParams.get('coachId');

    // Construir filtro
    const filter: any = {};

    if (objectiveId) {
      filter.objectiveId = objectiveId;
    }

    if (clientId) {
      filter.clientId = clientId;
    }

    if (coachId) {
      filter.coachId = coachId;
    }

    // Obtener sesiones ordenadas por fecha
    const meets = await Meet.find(filter).sort({ date: -1 });

    const formattedMeets = meets.map(meet => ({
      _id: meet._id.toString(),
      date: meet.date,
      link: meet.link,
      objectiveId: meet.objectiveId?.toString(),
      clientId: meet.clientId?.toString(),
      coachId: meet.coachId?.toString(),
      isCancelled: meet.isCancelled,
      createdAt: meet.createdAt,
    }));

    return NextResponse.json({
      success: true,
      meets: formattedMeets,
    });
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/meets/:id - Actualizar una sesion
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const { date, time } = await request.json();

    const meet = await Meet.findById(id);
    if (!meet) {
      return NextResponse.json({ error: 'Sesion not found' }, { status: 404 });
    }

    // Validar que la fecha y hora sean validas
    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    // Combinar fecha y hora en un solo objeto Date
    const meetDate = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':');
      meetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Actualizar la sesion
    const updatedMeet = await Meet.findByIdAndUpdate(id, { date: meetDate }, { new: true });
    if (!updatedMeet) {
      return NextResponse.json({ error: 'Error updating the session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Session updated successfully', meet: updatedMeet });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}