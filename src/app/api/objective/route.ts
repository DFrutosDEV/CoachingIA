import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Objective from '@/models/Objective';
import Meet from '@/models/Meet';
import Role from '@/models/Role';
import { generateJitsiLink } from '@/utils/generateJitsiLinks';
import {
  DEFAULT_LOCALE,
  formatUtcDate,
  formatUtcTime,
  getTimeZoneForLocale,
  normalizeLocale,
} from '@/utils/date-formatter';
import { fromZonedTime } from 'date-fns-tz';
import {
  sendAppointmentConfirmationEmail,
  sendWelcomeEmail,
} from '@/lib/services/email-service';
import { createIcsFile } from '@/utils/ics-service';

const MAX_TEXT_LENGTH = 50;

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getUtcMeetDate(startDate: string, startTime: string, timezone?: string | null) {
  const dateString = `${startDate}T${startTime}:00`;
  const timezoneToUse = timezone || getTimeZoneForLocale(DEFAULT_LOCALE);

  try {
    const utcDate = fromZonedTime(dateString, timezoneToUse);

    if (!Number.isNaN(utcDate.getTime())) {
      return utcDate;
    }
  } catch (error) {
    console.error('Zona horaria inválida, usando fallback:', timezoneToUse, error);
  }

  const fallbackDate = fromZonedTime(
    dateString,
    getTimeZoneForLocale(DEFAULT_LOCALE)
  );

  if (Number.isNaN(fallbackDate.getTime())) {
    throw new Error('INVALID_MEET_DATE');
  }

  return fallbackDate;
}

// POST: Crear un nuevo objetivo
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      focus,
      startDate,
      startTime,
      coachId,
      clientId, // Si se envía, es un usuario existente
    } = body;

    const normalizedFirstName = normalizeString(firstName);
    const normalizedLastName = normalizeString(lastName);
    const normalizedEmail = normalizeString(email).toLowerCase();
    const normalizedPhone = normalizeString(phone);
    const normalizedFocus = normalizeString(focus);
    const normalizedStartDate = normalizeString(startDate);
    const normalizedStartTime = normalizeString(startTime);
    const normalizedCoachId = normalizeString(coachId);
    const normalizedClientId = normalizeString(clientId);

    const locale = normalizeLocale(request.headers.get('x-locale'));
    const timezone =
      request.headers.get('x-timezone') || getTimeZoneForLocale(locale);

    // Validaciones básicas
    if (!normalizedFocus || !normalizedStartDate || !normalizedStartTime || !normalizedCoachId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Faltan campos requeridos: focus, startDate, startTime, coachId',
        },
        { status: 400 }
      );
    }

    if (
      normalizedFirstName.length > MAX_TEXT_LENGTH ||
      normalizedLastName.length > MAX_TEXT_LENGTH ||
      normalizedFocus.length > MAX_TEXT_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Los campos nombre, apellido y objetivo no pueden superar ${MAX_TEXT_LENGTH} caracteres`,
        },
        { status: 400 }
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(normalizedStartDate) ||
      !/^\d{2}:\d{2}$/.test(normalizedStartTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'La fecha u hora de inicio no tienen un formato válido',
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(normalizedCoachId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Coach inválido',
        },
        { status: 400 }
      );
    }

    if (normalizedClientId && !mongoose.Types.ObjectId.isValid(normalizedClientId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cliente inválido',
        },
        { status: 400 }
      );
    }

    let utcMeetDate: Date;
    try {
      utcMeetDate = getUtcMeetDate(normalizedStartDate, normalizedStartTime, timezone);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'La fecha de la primera sesión no es válida',
        },
        { status: 400 }
      );
    }

    // Verificar que el coach existe
    const coachProfile = await Profile.findOne({ _id: normalizedCoachId });
    if (!coachProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Coach no encontrado',
        },
        { status: 404 }
      );
    }

    // Verificar que el coach tiene puntos suficientes
    if (coachProfile.points < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Puntos insuficientes',
        },
        { status: 400 }
      );
    }

    // Obtener el ID del rol de cliente
    const clientRole = await Role.findOne({ code: '3' });
    if (!clientRole) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rol de cliente no encontrado en la base de datos',
        },
        { status: 500 }
      );
    }

    let clientIdToUse: string;
    // Si no se envía clientId, crear nuevo usuario
    if (!normalizedClientId) {
      if (!normalizedFirstName || !normalizedLastName || !normalizedEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'There are missing fields',
          },
          { status: 400 }
        );
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'There is already a user with this email',
          },
          { status: 400 }
        );
      }

      // Usar contraseña por defecto
      const defaultPassword = Math.random().toString(36).substring(2, 5).toLowerCase() + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 5).toLowerCase();

      // Crear nuevo usuario
      const newUser = new User({
        email: normalizedEmail,
        password: defaultPassword,
        active: true,
        firstLogin: false,
        isDeleted: false,
      });

      const savedUser = await newUser.save();

      // Crear perfil para el nuevo usuario
      const newProfile = new Profile({
        name: normalizedFirstName,
        lastName: normalizedLastName,
        phone: normalizedPhone,
        user: savedUser._id,
        role: clientRole._id,
        isDeleted: false,
      });

      await newProfile.save();

      // Enviar email de bienvenida
      try {
        // Obtener el email del coach desde su perfil
        const coachUser = await User.findById(coachProfile.user);
        const coachEmail = coachUser?.email || '';

        await sendWelcomeEmail(normalizedEmail, normalizedFirstName, defaultPassword, {
          name: coachProfile.name,
          lastName: coachProfile.lastName,
          email: coachEmail,
          phone: coachProfile.phone || '',
        });
      } catch (emailError) {
        console.error('Error enviando email de bienvenida:', emailError);
        // No fallamos la creación del usuario si falla el email
      }

      clientIdToUse = newProfile._id.toString();
    } else {
      clientIdToUse = normalizedClientId;
    }

    // Obtener el perfil del cliente
    const clientProfile = await Profile.findOne({ _id: clientIdToUse });
    if (!clientProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Perfil del cliente no encontrado',
        },
        { status: 404 }
      );
    }

    // Verificar si el cliente ya está en el array de clients del coach
    const isClientAlreadyAssigned = coachProfile.clients.some(
      (client: any) => client.toString() === clientProfile._id.toString()
    );

    // Si no está asignado, agregarlo al array de clients del coach
    if (!isClientAlreadyAssigned) {
      coachProfile.clients.push(clientProfile._id);
      await coachProfile.save();
    }

    // Desactivar cualquier objetivo activo previo del cliente
    await Objective.updateMany(
      { clientId: clientIdToUse, active: true },
      { active: false }
    );

    // Crear el objetivo
    const newObjective = new Objective({
      title: normalizedFocus,
      startDate: normalizedStartDate,
      createdBy: normalizedCoachId,
      clientId: clientIdToUse,
      coachId: normalizedCoachId,
      isCompleted: false,
      active: true,
    });

    const savedObjective = await newObjective.save();

    // Sacar 10 puntos al coach
    coachProfile.points -= 1;
    await coachProfile.save();

    // Crear el link de Jitsi Meet
    const meetLink = generateJitsiLink(utcMeetDate, clientIdToUse, normalizedCoachId);

    // Crear la reunión
    const newMeet = new Meet({
      date: utcMeetDate,
      link: meetLink,
      createdBy: normalizedCoachId,
      clientId: clientIdToUse,
      coachId: normalizedCoachId,
      objectiveId: savedObjective._id,
      isCancelled: false,
    });

    const savedMeet = await newMeet.save();

    try {
      const [clientUser, coachUser] = await Promise.all([
        User.findById(clientProfile.user).select('email'),
        User.findById(coachProfile.user).select('email'),
      ]);

      const clientName = `${clientProfile.name} ${clientProfile.lastName}`.trim();
      const coachName = `${coachProfile.name} ${coachProfile.lastName}`.trim();
      const icsFile = await createIcsFile({
        title: `Sesión de coaching - ${normalizedFocus}`,
        startDate: utcMeetDate,
        durationMinutes: 60,
        description: `Objetivo: ${normalizedFocus}`,
        location: 'Videoconsulta',
        meetingUrl: meetLink,
        organizer: coachUser?.email
          ? { email: coachUser.email, name: coachName }
          : undefined,
        attendees: [
          clientUser?.email ? { email: clientUser.email, name: clientName } : null,
          coachUser?.email ? { email: coachUser.email, name: coachName } : null,
        ].filter(
          (attendee): attendee is { email: string; name: string } => Boolean(attendee)
        ),
        fileNamePrefix: 'sesion-coaching',
      });

      await sendAppointmentConfirmationEmail({
        recipients: [
          clientUser?.email ? { email: clientUser.email, name: clientName } : null,
          coachUser?.email ? { email: coachUser.email, name: coachName } : null,
        ].filter(
          (recipient): recipient is { email: string; name: string } => Boolean(recipient)
        ),
        appointmentDate: formatUtcDate(utcMeetDate, {
          locale,
          timeZone: timezone,
          format: 'long',
        }),
        appointmentTime: formatUtcTime(utcMeetDate, {
          locale,
          timeZone: timezone,
          format: 'time-24',
        }),
        coachName,
        appointmentDuration: '60',
        meetingLink: meetLink,
        icsAttachment: icsFile,
      });
    } catch (emailError) {
      console.error('Error enviando confirmación de cita:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Objetivo y reunión creados exitosamente',
        data: {
          objective: savedObjective,
          meet: savedMeet,
          clientId: clientIdToUse,
          isNewUser: !clientId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/objective:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ValidationError'
    ) {
      const validationError = error as mongoose.Error.ValidationError;
      const firstMessage = Object.values(validationError.errors)[0]?.message;

      return NextResponse.json(
        {
          success: false,
          error: firstMessage || 'Error de validación',
        },
        { status: 400 }
      );
    }

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ya existe un usuario con este email',
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
