import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Objective from '@/models/Objective';

// PUT /api/objectives/[id]/config - Guardar respuestas del formulario de configuración
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { configFile } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de objetivo es requerido' },
        { status: 400 }
      );
    }

    if (!configFile || !Array.isArray(configFile)) {
      return NextResponse.json(
        { error: 'configFile es requerido y debe ser un array' },
        { status: 400 }
      );
    }

    // Verificar que el objetivo existe
    const objective = await Objective.findById(id);
    if (!objective) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el objetivo no tenga ya configFile (no se puede modificar)
    if (objective.configFile && objective.configFile.length > 0) {
      return NextResponse.json(
        { error: 'El formulario de configuración ya ha sido completado y no se puede modificar' },
        { status: 400 }
      );
    }

    // Actualizar el objetivo con las respuestas del formulario
    const updatedObjective = await Objective.findByIdAndUpdate(
      id,
      { 
        configFile: configFile.map((item: any) => ({
          question: item.question,
          answer: item.answer
        }))
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Formulario de configuración guardado correctamente',
      data: updatedObjective
    });

  } catch (error) {
    console.error('Error al guardar formulario de configuración:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/objectives/[id]/config - Obtener respuestas del formulario de configuración
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de objetivo es requerido' },
        { status: 400 }
      );
    }

    // Obtener el objetivo
    const objective = await Objective.findById(id);
    if (!objective) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        configFile: objective.configFile || [],
        hasConfigFile: objective.configFile && objective.configFile.length > 0
      }
    });

  } catch (error) {
    console.error('Error al obtener formulario de configuración:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
