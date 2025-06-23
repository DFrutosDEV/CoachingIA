import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/coach/search - Buscar usuarios por nombre, apellido o email
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    
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
    
    const users = await User.find(query)
      .select('_id name lastName email')
      .populate('roles', 'name')
      .limit(limit)
      .sort({ name: 1, lastName: 1 });
    
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