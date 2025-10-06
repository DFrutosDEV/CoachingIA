import { NextRequest, NextResponse } from 'next/server';
import ConfigForm from '@/models/ConfigForm';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener todas las preguntas de configuración activas
    const configForms = await ConfigForm.find({ active: true })
      .sort({ createdAt: 1 }) // Ordenar por fecha de creación
      .select('title isObligatory');

    return NextResponse.json({
      success: true,
      data: configForms,
    });
  } catch (error) {
    console.error('Error al obtener preguntas de configuración:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, isObligatory = false, createdBy } = body;

    if (!title || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Título y createdBy son requeridos',
        },
        { status: 400 }
      );
    }

    const newConfigForm = new ConfigForm({
      title,
      active: true,
      isObligatory,
      createdBy,
    });

    await newConfigForm.save();

    return NextResponse.json(
      {
        success: true,
        data: newConfigForm,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear pregunta de configuración:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
