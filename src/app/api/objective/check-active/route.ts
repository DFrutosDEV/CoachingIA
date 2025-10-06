import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Objective from '@/models/Objective';

// GET /api/objective/check-active - Verificar si un cliente tiene un objetivo activo
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID es requerido' },
        { status: 400 }
      );
    }

    // Buscar si el cliente tiene un objetivo activo
    const activeObjective = await Objective.findOne({
      clientId,
      active: true,
      isCompleted: false,
    });

    return NextResponse.json({
      success: true,
      hasActiveObjective: !!activeObjective,
      activeObjective: activeObjective
        ? {
            id: activeObjective._id,
            title: activeObjective.title,
          }
        : null,
    });
  } catch (error) {
    console.error('Error al verificar objetivo activo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
