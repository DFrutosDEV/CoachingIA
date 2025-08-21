import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/ai-service';
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

    // Verificar si Gemini está disponible
    const isGeminiAvailable = await aiService.checkGeminiStatus();
    if (!isGeminiAvailable) {
      return NextResponse.json(
        { 
          error: 'Gemini Pro no está disponible. Verifica tu API Key de Google AI.',
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
      message: 'Objetivos generados exitosamente con Gemini Pro'
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

// Endpoint para verificar el estado de Gemini
export async function GET() {
  try {
    const isGeminiAvailable = await aiService.checkGeminiStatus();

    return NextResponse.json({
      provider: 'Google Gemini Pro',
      available: isGeminiAvailable,
      environment: process.env.NODE_ENV,
      message: isGeminiAvailable 
        ? 'Gemini Pro está funcionando correctamente' 
        : 'Gemini Pro no está disponible. Verifica tu API Key.'
    });
  } catch (error) {
    console.error('Error verificando Gemini:', error);
    return NextResponse.json(
      { 
        provider: 'Google Gemini Pro',
        available: false,
        error: 'Error de verificación',
        message: 'No se pudo verificar el estado de Gemini Pro'
      },
      { status: 500 }
    );
  }
} 