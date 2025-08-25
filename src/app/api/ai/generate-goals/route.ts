import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/ai-service';
import connectDB from '@/lib/mongodb';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';
import dotenv from 'dotenv';
import { addWeeks } from 'date-fns';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

export async function GET() {
  try {
    const aiStatus = await aiService.checkGeminiStatus();
    
    return NextResponse.json({
      provider: aiStatus.provider,
      available: aiStatus.available,
      message: aiStatus.message,
      environment: aiStatus.environment
    });
  } catch (error) {
    console.error('Error verificando estado de Gemini:', error);
    return NextResponse.json({
      provider: 'Google Gemini',
      available: false,
      message: 'Error verificando estado de Gemini',
      environment: process.env.NODE_ENV || 'unknown'
    }, { status: 500 });
  }
}

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
    console.log(objective);
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

    // Preparar métricas para la IA
    const metrics = {
      clientBio: client.bio,
      configFile: objective.configFile,
      coachNotes: []
    };

    // Verificar si Gemini está disponible
    const aiStatus = await aiService.checkGeminiStatus();
    if (!aiStatus.available) {
      return NextResponse.json(
        { 
          error: `Google Gemini no está disponible. ${aiStatus.message}`,
          fallback: true 
        },
        { status: 503 }
      );
    }

    // Generar objetivos con Gemini
    const generatedGoals = await aiService.generateGoalsForObjective(objective, metrics, numberOfGoals);

    // Convertir a formato Goal
    const goals = generatedGoals.map((goal, index) => ({
      _id: `generated-${Date.now()}-${index}`,
      description: goal.description,
      day: goal.day,
      date: addWeeks(new Date(), index),
      isCompleted: goal.isCompleted,
      clientId: objective.clientId,
      objectiveId: objective._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    }));

    return NextResponse.json({
      goals,
      provider: aiStatus.provider,
      message: `Objetivos generados exitosamente con ${aiStatus.provider}`
    });

  } catch (error) {
    console.error('Error en generate-goals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 