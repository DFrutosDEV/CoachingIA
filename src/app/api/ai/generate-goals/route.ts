import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/ai-service-unified';
import connectDB from '@/lib/mongodb';
import Objective from '@/models/Objective';
import Goal from '@/models/Goal';
import Profile from '@/models/Profile';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { objectiveId, numberOfGoals = 5 } = body;

    if (!objectiveId) {
      return NextResponse.json(
        { error: 'Se requiere objectiveId' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener el objetivo
    const objective = await Objective.findById(objectiveId);
    if (!objective) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      );
    }

    // Obtener información del cliente
    const client = await Profile.findById(objective.clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener objetivos existentes del cliente
    const existingGoals = await Goal.find({
      clientId: objective.clientId,
      isDeleted: false
    }).sort({ createdAt: -1 }).limit(10);

    // Obtener notas del cliente (si tienes un modelo de notas)
    // const notes = await Note.find({ clientId: objective.clientId }).sort({ createdAt: -1 }).limit(5);

    // Preparar métricas para la IA
    const metrics = {
      clientFocus: client.focus || 'Desarrollo personal',
      clientBio: client.bio,
      currentGoals: existingGoals,
      performanceMetrics: {
        sessionsCompleted: client.sessions || 0,
        lastSessionDate: client.lastSession?.date || null
      },
      coachNotes: [] // Aquí puedes agregar las notas si las tienes
    };

    // Verificar si hay proveedores de IA disponibles
    const currentProvider = await aiService.getCurrentProvider();
    if (!currentProvider.available) {
      return NextResponse.json(
        { 
          error: `No hay proveedores de IA disponibles: ${currentProvider.error}`,
          fallback: true 
        },
        { status: 503 }
      );
    }

    // Generar objetivos con IA
    const generatedGoals = await aiService.generateGoalsForObjective(
      objective,
      metrics,
      numberOfGoals
    );

    // Crear los objetivos en la base de datos
    const createdGoals = await Promise.all(
      generatedGoals.map(async (goalData) => {
        const newGoal = new Goal({
          objectiveId: objective._id,
          description: goalData.description,
          createdBy: objective.createdBy,
          clientId: objective.clientId,
          day: goalData.day,
          isCompleted: goalData.isCompleted
        });

        return await newGoal.save();
      })
    );

    return NextResponse.json({
      success: true,
      goals: createdGoals,
      message: 'Objetivos generados exitosamente con IA'
    });

  } catch (error) {
    console.error('Error generando objetivos:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint para verificar el estado de los proveedores de IA
export async function GET() {
  try {
    const currentProvider = await aiService.getCurrentProvider();
    const availableProviders = await aiService.getAvailableProviders();

    return NextResponse.json({
      currentProvider: currentProvider,
      availableProviders: availableProviders,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error verificando proveedores de IA:', error);
    return NextResponse.json(
      { 
        currentProvider: { name: 'Ninguno', available: false, error: 'Error de verificación' },
        availableProviders: [],
        error: 'No se pudo verificar el estado de los proveedores'
      },
      { status: 500 }
    );
  }
} 