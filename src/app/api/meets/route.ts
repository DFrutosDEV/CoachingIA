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
    const meets = await Meet.find(filter)
      .sort({ date: -1 });

    const formattedMeets = meets.map(meet => ({
      _id: meet._id.toString(),
      date: meet.date,
      link: meet.link,
      objectiveId: meet.objectiveId?.toString(),
      clientId: meet.clientId?.toString(),
      coachId: meet.coachId?.toString(),
      isCancelled: meet.isCancelled,
      createdAt: meet.createdAt
    }));

    return NextResponse.json({
      success: true,
      meets: formattedMeets
    });

  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 