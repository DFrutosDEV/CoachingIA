import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meet from '@/models/Meet';
import { generateJitsiLink } from '@/lib/utils';

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
      const link = generateJitsiLink(
        meet.date.toISOString().split('T')[0], 
        meet.time, 
        clientId, 
        coachId
      );

      return {
        date: meet.date,
        time: meet.time,
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
      .sort({ date: 1, time: 1 });

    return NextResponse.json({
      success: true,
      meets
    });

  } catch (error) {
    console.error('Error al obtener meets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 