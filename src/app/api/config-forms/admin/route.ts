import { NextRequest, NextResponse } from 'next/server';
import ConfigForm from '@/models/ConfigForm';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener todas las preguntas de configuración (activas e inactivas)
    const configForms = await ConfigForm.find({})
      .sort({ createdAt: 1 }) // Ordenar por fecha de creación
      .populate('createdBy', 'name lastName');

    return NextResponse.json({
      success: true,
      data: configForms,
    });
  } catch (error) {
    console.error('Error al obtener formularios de configuración:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
