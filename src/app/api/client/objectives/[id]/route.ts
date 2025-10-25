import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Objective from '@/models/Objective';
import Goal from '@/models/Goal';
import Note from '@/models/Note';
import Pda from '@/models/Pda';

// GET /api/client/objectives/[id] - Obtener detalles de un objetivo específico
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

    // Obtener los Goals del objetivo
    const goals = await Goal.find({
      objectiveId: objective._id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    // Obtener las notas relacionadas con este objetivo
    const notes = await Note.find({
      objectiveId: objective._id,
      isDeleted: false,
    })
      .populate('createdBy', 'name lastName')
      .sort({ createdAt: -1 });

    // Obtener información del PDA si existe
    let pdaInfo = null;
    if (objective.aiConfig?.pdaFileId) {
      try {
        const pda = await Pda.findById(objective.aiConfig.pdaFileId);
        if (pda && !pda.isDeleted) {
          pdaInfo = {
            _id: pda._id.toString(),
            fileName: pda.fileName,
            fileSize: pda.fileSize,
            mimeType: pda.mimeType,
            uploadedAt: pda.uploadedAt,
          };
        }
      } catch (error) {
        console.warn('Error al obtener información del PDA:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        objective: {
          _id: objective._id.toString(),
          title: objective.title,
          isCompleted: objective.isCompleted,
          active: objective.active,
          createdAt: objective.createdAt,
          configFile: objective.configFile,
          aiConfig: objective.aiConfig,
        },
        goals: goals.map(goal => ({
          _id: goal._id.toString(),
          description: goal.description,
          isCompleted: goal.isCompleted,
          day: goal.day,
          createdAt: goal.createdAt,
        })),
        notes: notes.map(note => ({
          _id: note._id.toString(),
          content: note.content,
          createdBy: `${note.createdBy?.name} ${note.createdBy?.lastName}`,
          createdAt: note.createdAt,
        })),
        pdaInfo: pdaInfo,
      },
    });
  } catch (error) {
    console.error('Error al obtener detalles del objetivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
