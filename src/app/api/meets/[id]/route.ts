import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meet from '@/models/Meet';
import { fromZonedTime } from 'date-fns-tz';

// PATCH /api/meets/[id] - Actualizar una sesión específica
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const updateData = await request.json();
    
    // Obtener la zona horaria del header
    const timezone = request.headers.get('x-timezone') || 'America/Buenos_Aires';
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de sesión es requerido' },
        { status: 400 }
      );
    }

    // Validar que la sesión existe
    const existingMeet = await Meet.findById(id);
    if (!existingMeet) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Validar y convertir el campo date si está presente
    if (updateData.date && updateData.time) {
      try {
        // Combinar fecha y hora en la zona horaria local del usuario
        const dateString = `${updateData.date}T${updateData.time}:00`;
        
        // Convertir de la zona horaria local a UTC usando date-fns-tz
        const utcDate = fromZonedTime(dateString, timezone);
        
        if (isNaN(utcDate.getTime())) {
          return NextResponse.json(
            { error: 'Fecha inválida' },
            { status: 400 }
          );
        }
        
        updateData.date = utcDate;
        
        console.log('Debug timezone conversion:', {
          originalDate: updateData.date,
          originalTime: updateData.time,
          timezone: timezone,
          dateString: dateString,
          utcDate: utcDate.toISOString()
        });
        
        // Remover el campo time ya que no existe en el modelo
        delete updateData.time;
        
      } catch (error) {
        console.error('Error converting timezone:', error);
        return NextResponse.json(
          { error: 'Error al convertir zona horaria' },
          { status: 400 }
        );
      }
    }

    // Actualizar la sesión
    const updatedMeet = await Meet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'clientId',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      },
      {
        path: 'coachId',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      },
      {
        path: 'objectiveId',
        select: 'title description'
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Sesión actualizada correctamente',
      meet: updatedMeet
    });

  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/meets/[id] - Eliminar una sesión
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de sesión es requerido' },
        { status: 400 }
      );
    }

    // Validar que la sesión existe
    const existingMeet = await Meet.findById(id);
    if (!existingMeet) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la sesión
    await Meet.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Sesión eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/meets/[id] - Obtener una sesión específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de sesión es requerido' },
        { status: 400 }
      );
    }

    const meet = await Meet.findById(id)
      .populate([
        {
          path: 'clientId',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        },
        {
          path: 'coachId',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        },
        {
          path: 'objectiveId',
          select: 'title description'
        }
      ]);

    if (!meet) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      meet
    });

  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 