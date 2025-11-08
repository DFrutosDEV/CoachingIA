import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/ai-service';
import connectDB from '@/lib/mongodb';
import Objective from '@/models/Objective';
import Profile from '@/models/Profile';
import Pda from '@/models/Pda';
import dotenv from 'dotenv';
import { addWeeks } from 'date-fns';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

export async function GET() {
  try {
    const aiStatus = await aiService.checkAIStatus();

    return NextResponse.json({
      provider: aiStatus.provider,
      available: aiStatus.available,
      message: aiStatus.message,
      environment: aiStatus.environment,
    });
  } catch (error) {
    console.error('Error verificando estado de AI:', error);
    return NextResponse.json(
      {
        provider: 'AI Service',
        available: false,
        message: 'Error verificando estado de AI',
        environment: process.env.NODE_ENV || 'unknown',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      objectiveId,
      numberOfGoals = 30,
      aiConfig = {
        voiceTone: 'supportive',
        difficultyLevel: 'intermediate',
        challengeTypes: 'mixed',
        includeWeekends: false,
        pdaFileId: null
      }
    } = body;

    // Obtener el idioma del header Accept-Language o usar español por defecto
    const locale = request.headers.get('Accept-Language') || 'es';

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

    // Obtener archivo PDA si existe
    let pdaContent = null;
    if (aiConfig.pdaFileId) {
      try {
        const pda = await Pda.findById(aiConfig.pdaFileId);
        if (pda && !pda.isDeleted) {
          pdaContent = {
            fileName: pda.fileName,
            content: pda.fileData.toString('utf-8'), // Convertir Buffer a string
            mimeType: pda.mimeType
          };
        }
      } catch (error) {
        console.warn('Error al obtener archivo PDA:', error);
        // Continuar sin el archivo PDA
      }
    }

    // Actualizar la configuración de IA en el objetivo
    objective.aiConfig = {
      voiceTone: aiConfig.voiceTone,
      difficultyLevel: aiConfig.difficultyLevel,
      challengeTypes: aiConfig.challengeTypes,
      includeWeekends: aiConfig.includeWeekends,
      pdaFileId: aiConfig.pdaFileId
    };
    await objective.save();

    // Preparar métricas para la IA
    const metrics = {
      clientBio: client.bio,
      configFile: objective.configFile,
      coachNotes: [],
      aiConfig: aiConfig,
      pdaContent: pdaContent,
      locale: locale
    };

    // Verificar si AI está disponible
    const aiStatus = await aiService.checkAIStatus();
    if (!aiStatus.available) {
      return NextResponse.json(
        {
          error: `${aiStatus.provider} no está disponible. ${aiStatus.message}`,
          fallback: true,
        },
        { status: 503 }
      );
    }

    // Generar objetivos con AI
    const generatedGoals = await aiService.generateGoalsForObjective(
      objective,
      metrics,
      numberOfGoals
    );

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
      isDeleted: false,
      aforism: goal.aforism,
      tiempoEstimado: goal.tiempoEstimado,
      ejemplo: goal.ejemplo,
      indicadorExito: goal.indicadorExito,
    }));

    return NextResponse.json({
      goals,
      provider: aiStatus.provider,
      message: `Objetivos generados exitosamente con ${aiStatus.provider}`,
    });
  } catch (error) {
    console.error('Error en generate-goals:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
