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

    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    // Validar que sea un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF' },
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

    // Verificar si ya existe un PDA para este perfil
    const existingPda = await Pda.findOne({
      profile: profile._id,
      isDeleted: false,
    });

    let pda;

    if (existingPda) {
      // Actualizar PDA existente
      existingPda.fileName = file.name;
      existingPda.fileData = fileBuffer;
      existingPda.fileSize = file.size;
      existingPda.mimeType = file.type;
      existingPda.uploadedAt = new Date();

      pda = await existingPda.save();
    } else {
      // Crear nuevo PDA
      pda = new Pda({
        profile: profile._id,
        fileName: file.name,
        fileData: fileBuffer,
        fileSize: file.size,
        mimeType: file.type,
      });

      pda = await pda.save();
    }

    return NextResponse.json({
      message: existingPda
        ? 'PDA actualizado exitosamente'
        : 'PDA creado exitosamente',
      data: {
        id: pda._id,
        fileName: pda.fileName,
        fileSize: pda.fileSize,
        mimeType: pda.mimeType,
        uploadedAt: pda.uploadedAt,
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
