import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pda from '@/models/Pda';
import Profile from '@/models/Profile';
import { verifyToken } from '@/lib/auth-jwt';

interface DecodedToken {
  id: string;
  [key: string]: any;
}

// GET - Obtener PDA del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const decoded = verifyToken(token) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    await connectDB();

    // Buscar el perfil del usuario
    const profile = await Profile.findOne({
      user: decoded.id,
      isDeleted: false,
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Buscar el PDA del perfil
    const pda = await Pda.findOne({
      profile: profile._id,
      isDeleted: false,
    }).select('-fileData'); // Excluir los datos binarios del archivo

    if (!pda) {
      return NextResponse.json({ message: 'No hay PDA cargado', data: null });
    }

    return NextResponse.json({
      message: 'PDA encontrado',
      data: {
        id: pda._id,
        fileName: pda.fileName,
        fileSize: pda.fileSize,
        mimeType: pda.mimeType,
        uploadedAt: pda.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Error al obtener PDA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar PDA
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const decoded = verifyToken(token) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    await connectDB();

    // Buscar el perfil del usuario
    const profile = await Profile.findOne({
      user: decoded.id,
      isDeleted: false,
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const objectiveId = formData.get('objectiveId') as string;
    const profileId = formData.get('profile') as string;

    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    // Validar tipos de archivo permitidos
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF, DOC y DOCX' },
        { status: 400 }
      );
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo no puede ser mayor a 10MB' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Determinar el perfil a usar (puede ser el del usuario autenticado o el especificado)
    let targetProfileId = profile._id;
    if (profileId) {
      // Si se especifica un profileId, usarlo (para casos donde se carga desde el generador de IA)
      targetProfileId = profileId;
    }

    // Verificar si ya existe un PDA para este perfil y objetivo
    let existingPda;
    if (objectiveId) {
      existingPda = await Pda.findOne({
        profile: targetProfileId,
        objectiveId: objectiveId,
        isDeleted: false,
      });
    } else {
      existingPda = await Pda.findOne({
        profile: targetProfileId,
        objectiveId: { $exists: false },
        isDeleted: false,
      });
    }

    let pda;

    if (existingPda) {
      // Actualizar PDA existente
      existingPda.fileName = file.name;
      existingPda.fileData = fileBuffer;
      existingPda.fileSize = file.size;
      existingPda.mimeType = file.type;
      existingPda.uploadedAt = new Date();
      if (objectiveId) {
        existingPda.objectiveId = objectiveId;
      }

      pda = await existingPda.save();
    } else {
      // Crear nuevo PDA
      const pdaData: any = {
        profile: targetProfileId,
        fileName: file.name,
        fileData: fileBuffer,
        fileSize: file.size,
        mimeType: file.type,
      };

      if (objectiveId) {
        pdaData.objectiveId = objectiveId;
      }

      pda = new Pda(pdaData);
      pda = await pda.save();
    }

    return NextResponse.json({
      success: true,
      message: existingPda
        ? 'PDA actualizado exitosamente'
        : 'PDA creado exitosamente',
      pdaId: pda._id,
      data: {
        id: pda._id,
        fileName: pda.fileName,
        fileSize: pda.fileSize,
        mimeType: pda.mimeType,
        uploadedAt: pda.uploadedAt,
        objectiveId: pda.objectiveId,
      },
    });
  } catch (error) {
    console.error('Error al crear/actualizar PDA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Descargar PDA por ID
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pdaId } = body;

    if (!pdaId) {
      return NextResponse.json({ error: 'PDA ID requerido' }, { status: 400 });
    }

    await connectDB();

    // Buscar el PDA
    const pda = await Pda.findById(pdaId);
    if (!pda || pda.isDeleted) {
      return NextResponse.json({ error: 'PDA no encontrado' }, { status: 404 });
    }

    // Convertir el Buffer a base64 para enviarlo al frontend
    const fileBase64 = pda.fileData.toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        fileName: pda.fileName,
        fileData: fileBase64,
        mimeType: pda.mimeType,
        fileSize: pda.fileSize,
      },
    });
  } catch (error) {
    console.error('Error al descargar PDA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar PDA
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const decoded = verifyToken(token) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    await connectDB();

    // Buscar el perfil del usuario
    const profile = await Profile.findOne({
      user: decoded.id,
      isDeleted: false,
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Buscar y marcar como eliminado el PDA
    const pda = await Pda.findOne({
      profile: profile._id,
      isDeleted: false,
    });

    if (!pda) {
      return NextResponse.json({ error: 'PDA no encontrado' }, { status: 404 });
    }

    pda.isDeleted = true;
    await pda.save();

    return NextResponse.json({ message: 'PDA eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar PDA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
