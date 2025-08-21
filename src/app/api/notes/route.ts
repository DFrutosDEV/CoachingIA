import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import Profile from '@/models/Profile';

// POST /api/notes - Crear una nueva nota
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { title, content, objectiveId, clientId, coachId, sessionId } = body;
    
    // Validaciones
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'El contenido es requerido' },
        { status: 400 }
      );
    }

    if (!objectiveId) {
      return NextResponse.json(
        { error: 'El ID del objetivo es requerido' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'El ID del cliente es requerido' },
        { status: 400 }
      );
    }

    if (!coachId) {
      return NextResponse.json(
        { error: 'El ID del coach es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el perfil del coach existe
    const coachProfile = await Profile.findById(coachId);
    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    // Crear la nota
    const newNote = new Note({
      title: title.trim(),
      content: content.trim(),
      objectiveId,
      clientId,
      coachId,
      sessionId: sessionId || undefined,
      createdBy: coachId, // El coach que crea la nota
      isDeleted: false
    });

    await newNote.save();

    return NextResponse.json({
      success: true,
      message: 'Nota creada correctamente',
      data: {
        _id: newNote._id,
        title: newNote.title,
        content: newNote.content,
        objectiveId: newNote.objectiveId,
        clientId: newNote.clientId,
        coachId: newNote.coachId,
        sessionId: newNote.sessionId,
        createdAt: newNote.createdAt
      }
    });

  } catch (error) {
    console.error('Error al crear nota:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/notes - Obtener notas (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objectiveId');
    const clientId = searchParams.get('clientId');
    const sessionId = searchParams.get('sessionId');
    
    // Construir filtro
    const filter: any = { isDeleted: false };
    
    if (objectiveId) {
      filter.objectiveId = objectiveId;
    }
    
    if (clientId) {
      filter.clientId = clientId;
    }
    
    if (sessionId) {
      filter.sessionId = sessionId;
    }

    // Obtener notas con información del creador
    const notes = await Note.find(filter)
      .populate({
        path: 'createdBy',
        model: Profile,
        populate: {
          path: 'user',
          model: 'User',
          select: 'name lastName'
        }
      })
      .sort({ createdAt: -1 });

    const formattedNotes = notes.map(note => ({
      _id: note._id.toString(),
      title: note.title,
      content: note.content,
      objectiveId: note.objectiveId?.toString(),
      clientId: note.clientId?.toString(),
      coachId: note.coachId?.toString(),
      sessionId: note.sessionId?.toString(),
      createdBy: note.createdBy?.user ? 
        `${note.createdBy.user.name} ${note.createdBy.user.lastName}` : 
        'Usuario desconocido',
      createdAt: note.createdAt
    }));

    return NextResponse.json({
      success: true,
      notes: formattedNotes
    });

  } catch (error) {
    console.error('Error al obtener notas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 