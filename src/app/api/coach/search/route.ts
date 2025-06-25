import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';

// GET /api/coach/search - Buscar usuarios por nombre, apellido o email
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const coachId = searchParams.get('coachId');
    let query: any = { active: true, isDeleted: { $ne: true } };
    
    // Si hay parámetro de búsqueda, buscar por nombre, apellido o email
    if (search && search.length >= 3) {
      const searchRegex = new RegExp(search, 'i'); // Búsqueda case-insensitive
      query.$or = [
        { name: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    const coach = await Profile.findOne({ _id: coachId, isDeleted: { $ne: true } })
      .select('clients')
      .populate('clients', '_id name lastName email');
    
    const users = coach?.clients.map((client: any) => ({
      _id: client._id,
      name: client.name,
      lastName: client.lastName,
      email: client.email
    }));
    
    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}