import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Role from '@/models/Role';

// GET /api/admin/coaches/stats - Obtener estadísticas de coaches
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Buscar el rol de coach
    const coachRole = await Role.findOne({ code: '2', active: true });
    if (!coachRole) {
      return NextResponse.json(
        { error: 'Rol de coach no encontrado' },
        { status: 404 }
      );
    }

    // Obtener estadísticas usando agregación de MongoDB
    const stats = await Profile.aggregate([
      {
        $match: {
          role: coachRole._id,
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: '$userData'
      },
      {
        $match: {
          'userData.isDeleted': false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$userData.active', true] }, 1, 0]
            }
          },
          newCoaches: {
            $sum: {
              $cond: [{ $eq: ['$userData.firstLogin', true] }, 1, 0]
            }
          },
          totalClients: {
            $sum: { $size: { $ifNull: ['$clients', []] } }
          }
        }
      }
    ]);

    // Si no hay coaches, devolver estadísticas en cero
    if (stats.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total: 0,
          active: 0,
          inactive: 0,
          newCoaches: 0,
          totalClients: 0,
          averageClientsPerCoach: 0
        }
      });
    }

    const coachStats = stats[0];
    const inactive = coachStats.total - coachStats.active;
    const averageClientsPerCoach = coachStats.total > 0 
      ? Math.round((coachStats.totalClients / coachStats.total) * 100) / 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        total: coachStats.total,
        active: coachStats.active,
        inactive,
        newCoaches: coachStats.newCoaches,
        totalClients: coachStats.totalClients,
        averageClientsPerCoach
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de coaches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 