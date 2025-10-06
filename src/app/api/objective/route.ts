import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Objective from '@/models/Objective';
import Meet from '@/models/Meet';
import Role from '@/models/Role';
import { generateJitsiLink } from '@/utils/generateJitsiLinks';
import { fromZonedTime } from 'date-fns-tz';
import { sendWelcomeEmail } from '@/lib/services/email-service';

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

    // Obtener la zona horaria del header Accept-Language o usar una por defecto
    const timezone =
      request.headers.get('x-timezone') || 'America/Buenos_Aires'; // Fallback

    // Validaciones básicas
    if (!focus || !startDate || !startTime || !coachId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Faltan campos requeridos: focus, startDate, startTime, coachId',
        },
        { status: 400 }
      );
    }

    // Verificar que el coach existe
    const coachProfile = await Profile.findOne({ _id: coachId });
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
    if (coachProfile.points < 10) {
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
    if (!clientId) {
      if (!firstName || !lastName || !email) {
        return NextResponse.json(
          {
            success: false,
            error: 'There are missing fields',
          },
          { status: 400 }
        );
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email });
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
      const defaultPassword = '!Password1';

      // Crear nuevo usuario
      const newUser = new User({
        email,
        password: defaultPassword,
        active: true,
        firstLogin: false,
        isDeleted: false,
      });

      const savedUser = await newUser.save();

      // Crear perfil para el nuevo usuario
      const newProfile = new Profile({
        name: firstName,
        lastName: lastName,
        phone: phone,
        user: savedUser._id,
        role: clientRole._id,
        isDeleted: false,
      });

      await newProfile.save();

      // Enviar email de bienvenida
      try {
        await sendWelcomeEmail(email, firstName, defaultPassword);
      } catch (emailError) {
        console.error('Error enviando email de bienvenida:', emailError);
        // No fallamos la creación del usuario si falla el email
      }

      clientIdToUse = newProfile._id.toString();
    } else {
      clientIdToUse = clientId;
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
      title: focus,
      createdBy: coachId,
      clientId: clientIdToUse,
      coachId,
      isCompleted: false,
      active: true,
    });

    const savedObjective = await newObjective.save();

    // Sacar 10 puntos al coach
    coachProfile.points -= 10;
    await coachProfile.save();

    // Crear la fecha combinando startDate y startTime
    const dateString = `${startDate}T${startTime}:00`;
    // Convertir la fecha/hora local y zona horaria a UTC
    const utcMeetDate = fromZonedTime(dateString, timezone);

    // Crear el link de Jitsi Meet
    const meetLink = generateJitsiLink(utcMeetDate, clientIdToUse, coachId);

    // Crear la reunión
    const newMeet = new Meet({
      date: utcMeetDate,
      link: meetLink,
      createdBy: coachId,
      clientId: clientIdToUse,
      coachId,
      objectiveId: savedObjective._id,
      isCancelled: false,
    });

    const savedMeet = await newMeet.save();

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
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
