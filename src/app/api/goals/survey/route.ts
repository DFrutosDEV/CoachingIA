import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import { verifyToken } from '@/lib/auth-jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { token, rating, comment } = body;

    // Validar que el token esté presente
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token mancante',
        },
        { status: 400 }
      );
    }

    // Validar que el rating esté presente y sea válido
    if (!rating || !['excellent', 'so-so', 'bad'].includes(rating)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating non valido',
        },
        { status: 400 }
      );
    }

    // Decodificar el token para obtener el goalId
    const decoded = verifyToken(token);

    if (!decoded || !decoded.goalId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token non valido o scaduto',
        },
        { status: 401 }
      );
    }

    const goalId = decoded.goalId;

    // Buscar el Goal
    const goal = await Goal.findById(goalId);

    if (!goal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Goal non trovato',
        },
        { status: 404 }
      );
    }

    // Verificar que el Goal esté completado
    if (!goal.isCompleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Il Goal deve essere completato prima di inviare la risposta',
        },
        { status: 400 }
      );
    }

    // Actualizar el Goal con los datos de la encuesta
    goal.surveyRating = rating;
    if (comment && comment.trim().length > 0) {
      goal.surveyComment = comment.trim();
    }

    await goal.save();

    console.log(`✅ Encuesta guardada para Goal ${goalId}: ${rating}`);

    return NextResponse.json({
      success: true,
      message: 'Risposta salvata con successo',
    });
  } catch (error) {
    console.error('Error procesando encuesta:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Errore sconosciuto';

    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

