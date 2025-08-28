import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meet from '@/models/Meet';
import Profile from '@/models/Profile';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import User from '@/models/User';
import Objective from '@/models/Objective';
import { toZonedTime } from 'date-fns-tz';
import { getBrowserLocale } from '@/utils/validatesInputs';

// Configurar dayjs con el plugin UTC
dayjs.extend(utc);

// GET /api/calendar - Obtener sesiones para el calendario
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType'); // 'coach', 'client', 'admin'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const timezone = searchParams.get('timezone') || 'America/Buenos_Aires'; // Zona horaria del usuario
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID es requerido' },
        { status: 400 }
      );
    }

    // Obtener el perfil del usuario
    const userProfile = await Profile.findOne({ user: userId, isDeleted: false });
    if (!userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      );
    }

    // Construir la consulta base
    let query: any = { isCancelled: false };

    // Filtrar por tipo de usuario
    if (userType === 'coach') {
      query.coachId = userProfile._id;
    } else if (userType === 'client') {
      query.clientId = userProfile._id;
    }
    // Para admin, mostrar todas las sesiones

    // Filtrar por rango de fechas si se proporciona
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Obtener las sesiones con información completa
    const meets = await Meet.find(query)
      .populate({
        path: 'clientId',
        model: Profile,
        populate: {
          path: 'user',
          model: User,
        }
      })
      .populate({
        path: 'coachId',
        model: Profile,
        populate: {
          path: 'user',
          model: User,
        }
      })
      .populate({
        path: 'objectiveId',
        model: Objective,
      })
      .sort({ date: 1 });

    // Transformar los datos para el calendario
    const calendarEvents = meets.map(meet => {
      const clientName = `${meet.clientId?.name} ${meet.clientId?.lastName}` || 'Cliente desconocido';
      const coachName = `${meet.coachId?.name} ${meet.coachId?.lastName}` || 'Coach desconocido';

      // Convertir la fecha UTC a la zona horaria del usuario
      const utcDate = new Date(meet.date);
      const zonedDate = toZonedTime(utcDate, timezone);
      
      // Crear fecha de inicio y fin (1 hora de duración por defecto)
      const startDate = new Date(zonedDate);
      const endDate = new Date(zonedDate.getTime() + 60 * 60 * 1000); // +1 hora

      return {
        id: meet._id.toString(),
        title: `${meet.objectiveId.title} - ${clientName}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        description: '',
        client: clientName,
        coach: coachName,
        link: meet.link,
        time: zonedDate.toLocaleTimeString(getBrowserLocale(), { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        objectiveTitle: meet.objectiveId.title
      };
    });

    return NextResponse.json({
      success: true,
      events: calendarEvents
    });

  } catch (error) {
    console.error('Error al obtener sesiones del calendario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 