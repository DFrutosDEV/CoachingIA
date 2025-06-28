import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';

// POST /api/coach - Asignar un cliente a un coach
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { coachId, clientId } = await request.json();
    
    if (!coachId || !clientId) {
      return NextResponse.json(
        { error: 'Coach ID y Client ID son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que ambos usuarios existen
    const coachUser = await User.findById(coachId);
    const clientUser = await User.findById(clientId);
    
    if (!coachUser || !clientUser) {
      return NextResponse.json(
        { error: 'Coach o cliente no encontrado' },
        { status: 404 }
      );
    }

    // Buscar los perfiles correspondientes
    const coachProfile = await Profile.findOne({ user: coachId, isDeleted: false });
    const clientProfile = await Profile.findOne({ user: clientId, isDeleted: false });

    if (!coachProfile || !clientProfile) {
      return NextResponse.json(
        { error: 'Perfil de coach o cliente no encontrado' },
        { status: 404 }
      );
    }

    // Agregar cliente al coach si no está ya asignado
    if (!coachProfile.clients.includes(clientProfile._id)) {
      coachProfile.clients.push(clientProfile._id);
      await coachProfile.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente asignado al coach correctamente'
    });

  } catch (error) {
    console.error('Error al asignar cliente al coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
