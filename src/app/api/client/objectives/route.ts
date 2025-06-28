import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Objective from '@/models/Objective';
import Goal from '@/models/Goal';
import Note from '@/models/Note';
import Profile from '@/models/Profile';

// GET /api/client/objectives - Obtener todos los objetivos del cliente
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

    // Verificar que el cliente existe y obtener su perfil
    const client = await User.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el perfil del cliente
    const clientProfile = await Profile.findOne({ user: clientId, isDeleted: false });
    if (!clientProfile) {
      return NextResponse.json(
        { error: 'Perfil del cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los objetivos del cliente
    const objectives = await Objective.find({
      clientId: clientProfile._id
    })
    .populate({
      path: 'coachId',
      model: Profile,
      populate: {
        path: 'user',
        model: User,
        select: 'name lastName'
      }
    })
    .sort({ createdAt: -1 });

    // Calcular progreso de cada objetivo basado en sus Goals
    const objectivesWithProgress = await Promise.all(
      objectives.map(async (objective) => {
        const objectiveGoals = await Goal.find({
          objectiveId: objective._id,
          clientId: clientProfile._id,
          isDeleted: false
        });

        const totalGoals = objectiveGoals.length;
        const completedGoals = objectiveGoals.filter(goal => goal.isCompleted).length;
        const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

        return {
          id: objective._id.toString(),
          title: objective.title,
          progress: Math.round(progress),
          totalGoals,
          completedGoals,
          hasGoals: totalGoals > 0,
          isCompleted: objective.isCompleted,
          active: objective.active,
          createdAt: objective.createdAt,
          coach: `${objective.coachId?.user?.name} ${objective.coachId?.user?.lastName}` || 'Coach no asignado'
        };
      })
    );

    return NextResponse.json({
      success: true,
      objectives: objectivesWithProgress
    });

  } catch (error) {
    console.error('Error al obtener objetivos del cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 