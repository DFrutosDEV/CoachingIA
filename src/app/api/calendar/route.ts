import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meet from '@/models/Meet';
import Profile from '@/models/Profile';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import User from '@/models/User';

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
        model: 'Profile',
        populate: {
          path: 'user',
          model: 'User',
        }
      })
      .populate({
        path: 'coachId',
        model: 'Profile',
        populate: {
          path: 'user',
          model: 'User',
        }
      })
      .sort({ date: 1, time: 1 });

    // Transformar los datos para el calendario
    const calendarEvents = meets.map(meet => {
      // Extraer la fecha directamente del string ISO sin usar dayjs
      const dateStr = meet.date.toISOString().split('T')[0]; // Obtiene solo YYYY-MM-DD
      const [hours, minutes] = meet.time.split(':').map(Number);
      
      // Crear la fecha usando los componentes originales
      const startDate = new Date(
        parseInt(dateStr.split('-')[0]), // año
        parseInt(dateStr.split('-')[1]) - 1, // mes (0-indexed)
        parseInt(dateStr.split('-')[2]), // día
        hours,
        minutes,
        0,
        0
      );
      const endDate = new Date(startDate); // Misma fecha que start

      //! Debug detallado
      console.log('=== DEBUG FECHAS ===');
      console.log('Meet original:', {
        date: meet.date,
        time: meet.time,
        dateStr
      });
      console.log('Fecha creada:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateLocal: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss')
      });
      console.log('===================');
      //! BORRAR

      const clientName = `${meet.clientId?.user?.name} ${meet.clientId?.user?.lastName}` || 'Cliente desconocido';
      const coachName = `${meet.coachId?.user?.name} ${meet.coachId?.user?.lastName}` || 'Coach desconocido';
      const objectiveTitle = 'Objetivo'; // Temporal hasta que se resuelva el populate

      // Debug para ver la estructura de los datos
      console.log('Meet data:', {
        clientId: meet.clientId,
        coachId: meet.coachId,
        clientName,
        coachName
      });
      console.log('startDate', `${dateStr}T${meet.time}:00`);
      console.log('endDate', `${dateStr}T${meet.time}:00`);
      return {
        id: meet._id.toString(),
        title: `${objectiveTitle} - ${clientName}`,
        start: `${dateStr}T${meet.time}:00`,
        end: `${dateStr}T${meet.time}:00`,
        description: '',
        client: clientName,
        coach: coachName,
        link: meet.link,
        time: meet.time,
        objectiveTitle: objectiveTitle
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