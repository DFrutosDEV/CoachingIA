import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meet from '@/models/Meet';
import { generateJitsiLink } from '@/utils/generateJitsiLinks';

// POST /api/meets - Crear múltiples meets para un cliente
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { clientId, coachId, objectiveId, meets } = await request.json();
    
    if (!clientId || !coachId || !objectiveId || !meets || !Array.isArray(meets)) {
      return NextResponse.json(
        { error: 'clientId, coachId, objectiveId y meets son requeridos' },
        { status: 400 }
      );
    }

    // Crear los meets en la base de datos
    const meetsToCreate = meets.map((meet: any) => {
      // Combinar fecha y hora en un solo objeto Date
      const meetDate = new Date(meet.date);
      if (meet.time) {
        const [hours, minutes] = meet.time.split(':');
        meetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      const link = generateJitsiLink(meetDate, clientId, coachId);

      return {
        date: meetDate,
        link,
        createdBy: coachId,
        clientId,
        coachId,
        objectiveId,
        isCancelled: false
      };
    });

    const createdMeets = await Meet.insertMany(meetsToCreate);

    return NextResponse.json({
      success: true,
      message: `${createdMeets.length} reuniones creadas correctamente`,
      meets: createdMeets
    });

  } catch (error) {
    console.error('Error al crear meets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/meets - Obtener meets de un cliente
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const coachId = searchParams.get('coachId');
    const timezone = searchParams.get('timezone') || 'America/Mexico_City';
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID es requerido' },
        { status: 400 }
      );
    }

    const query: any = { 
      clientId, 
      isCancelled: false 
    };

    if (coachId) {
      query.coachId = coachId;
    }

    const meets = await Meet.find(query)
      .populate('objectiveId', 'title description')
      .sort({ date: 1 });

    // Transformar las fechas a la zona horaria del cliente
    const meetsWithLocalTime = meets.map(meet => {
      const meetObj = meet.toObject();
      return {
        ...meetObj,
        localDate: meet.getLocalDateString(timezone),
        localTime: meet.getLocalTime(timezone),
        time: meet.getLocalTime(timezone) // Mantener compatibilidad con el frontend
      };
    });

    return NextResponse.json({
      success: true,
      meets: meetsWithLocalTime
    });

  } catch (error) {
    console.error('Error al obtener meets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 