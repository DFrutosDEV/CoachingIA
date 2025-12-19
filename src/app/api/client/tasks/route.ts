import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Objective from '@/models/Objective';
import Goal from '@/models/Goal';
import Note from '@/models/Note';
import Feedback from '@/models/Feedback';
import Meet from '@/models/Meet';
import User from '@/models/User';

// GET /api/client/tasks - Obtener datos para la página de tareas del cliente
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID es requerido' },
        { status: 400 }
      );
    }

    // Obtener el perfil del cliente
    const clientProfile = await Profile.findOne({
      _id: profileId,
      isDeleted: false,
    });
    if (!clientProfile) {
      return NextResponse.json(
        { error: 'Perfil del cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el último objetivo activo o el más reciente completado
    const activeObjective = await Objective.findOne({
      clientId: clientProfile._id,
      active: true,
      isCompleted: false,
    }).populate({
      path: 'coachId',
      model: Profile,
      populate: {
        path: 'user',
        model: User,
        select: 'name lastName',
      },
    });

    // Si no hay objetivo activo, buscar el último completado
    let currentObjective = activeObjective;
    if (!currentObjective) {
      currentObjective = await Objective.findOne({
        clientId: clientProfile._id,
        isCompleted: true,
      })
        .populate({
          path: 'coachId',
          model: Profile,
          populate: {
            path: 'user',
            model: User,
            select: 'name lastName',
          },
        })
        .sort({ updatedAt: -1 });
    }

    if (!currentObjective) {
      return NextResponse.json({
        success: true,
        data: {
          currentObjective: null,
          goals: [],
          notes: [],
          feedback: null,
          hasData: false,
        },
      });
    }

    // Calcular la fecha de hoy al final del día (23:59:59) para incluir el día actual
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Obtener los goals del objetivo actual solo hasta el día actual (incluyendo hoy)
    const goals = await Goal.find({
      objectiveId: currentObjective._id,
      // clientId: clientProfile._id,
      isDeleted: false,
      date: { $lte: todayEnd }, // Solo goals hasta hoy (incluyendo hoy)
    }).sort({ day: 1, createdAt: 1 });

    // Obtener las notas relacionadas con este objetivo
    const notes = await Note.find({
      objectiveId: currentObjective._id,
      clientId: clientProfile._id,
      isDeleted: false,
    })
      .populate({
        path: 'createdBy',
        model: Profile,
        populate: {
          path: 'user',
          model: User,
          select: 'email',
        },
      })
      .populate({
        path: 'sessionId',
        model: Meet,
        select: 'date link',
      })
      .sort({ createdAt: -1 });

    // Obtener el feedback final si el objetivo está completado
    let feedback = null;
    if (currentObjective.isCompleted) {
      // Buscar feedback relacionado con este objetivo
      const objectiveFeedback = await Feedback.findOne({
        objectiveId: currentObjective._id,
        clientId: clientProfile._id,
      });

      if (objectiveFeedback) {
        feedback = {
          _id: objectiveFeedback._id.toString(),
          feedback: objectiveFeedback.feedback,
          createdAt: objectiveFeedback.createdAt,
        };
      }
    }

    // Formatear los datos para el frontend
    const formattedGoals = goals.map(goal => ({
      _id: goal._id.toString(),
      description: goal.description,
      day: goal.day,
      date: goal.date, // Incluir la fecha completa para comparar con el día actual
      isCompleted: goal.isCompleted,
      createdAt: goal.createdAt,
    }));

    const formattedNotes = notes.map(note => ({
      _id: note._id.toString(),
      title: note.title,
      content: note.content,
      createdBy: note.createdBy
        ? `${note.createdBy.name} ${note.createdBy.lastName}`
        : 'Coach',
      createdAt: note.createdAt,
      sessionInfo: note.sessionId
        ? {
          date: note.sessionId.date,
          link: note.sessionId.link,
        }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        currentObjective: {
          _id: currentObjective._id.toString(),
          title: currentObjective.title,
          isCompleted: currentObjective.isCompleted,
          active: currentObjective.active,
          createdAt: currentObjective.createdAt,
          coach: currentObjective.coachId
            ? `${currentObjective.coachId.name} ${currentObjective.coachId.lastName}`
            : 'Coach no asignado',
        },
        goals: formattedGoals,
        notes: formattedNotes,
        feedback,
        hasData: true,
      },
    });
  } catch (error) {
    console.error('Error al obtener datos de tareas del cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
