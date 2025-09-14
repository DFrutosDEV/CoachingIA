import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pda from '@/models/Pda';
import Profile from '@/models/Profile';
import { verifyToken } from '@/lib/auth-jwt';

interface DecodedToken {
  id: string;
  [key: string]: any;
}

// GET - Descargar PDA del usuario autenticado
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
      isDeleted: false 
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    // Buscar el PDA del perfil
    const pda = await Pda.findOne({ 
      profile: profile._id, 
      isDeleted: false 
    });

    if (!pda) {
      return NextResponse.json({ error: 'PDA no encontrado' }, { status: 404 });
    }

    // Crear respuesta con el archivo PDF
    const response = new NextResponse(pda.fileData);
    response.headers.set('Content-Type', pda.mimeType);
    response.headers.set('Content-Disposition', `attachment; filename="${pda.fileName}"`);
    response.headers.set('Content-Length', pda.fileSize.toString());

    return response;

  } catch (error) {
    console.error('Error al descargar PDA:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
