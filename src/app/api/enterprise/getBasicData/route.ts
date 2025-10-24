import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Role from '@/models/Role';
import Meet from '@/models/Meet';
import Ticket from '@/models/Ticket';
import Enterprise from '@/models/Enterprise';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const enterpriseId = searchParams.get('enterpriseId');

    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: 'ID de empresa requerido' },
        { status: 400 }
      );
    }

    // Verificar que la empresa existe
    const enterprise = await Enterprise.findById(enterpriseId);
    if (!enterprise || enterprise.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Obtener roles para identificar tipos de usuario
    const roles = await Role.find({ active: true });

    const clientRole = roles.find(role => role.code === '3'); // Client tiene código '3'
    const coachRole = roles.find(role => role.code === '2'); // Coach tiene código '2'

    if (!clientRole || !coachRole) {
      return NextResponse.json(
        { success: false, error: 'Roles no encontrados' },
        { status: 500 }
      );
    }

    // Calcular fechas para filtros
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Total de usuarios de la empresa (todos los usuarios activos)
    const totalUsers = await Profile.countDocuments({
      enterprise: enterpriseId,
      isDeleted: false,
    });

    // 2. Nuevos usuarios de la empresa este mes
    const newUsersThisMonth = await Profile.countDocuments({
      enterprise: enterpriseId,
      isDeleted: false,
      createdAt: { $gte: startOfMonth },
    });

    // 3. Coaches activos de la empresa
    const activeCoaches = await Profile.countDocuments({
      enterprise: enterpriseId,
      role: coachRole._id,
      isDeleted: false,
    });

    // 4. Nuevos coaches de la empresa este mes
    const newCoachesThisMonth = await Profile.countDocuments({
      enterprise: enterpriseId,
      role: coachRole._id,
      isDeleted: false,
      createdAt: { $gte: startOfMonth },
    });

    // 5. Sesiones completadas de la empresa (no canceladas y en el pasado)
    const completedSessions = await Meet.countDocuments({
      isCancelled: false,
      date: { $lt: now },
      $or: [
        {
          clientId: {
            $in: await Profile.find({ enterprise: enterpriseId }).distinct(
              '_id'
            ),
          },
        },
        {
          coachId: {
            $in: await Profile.find({ enterprise: enterpriseId }).distinct(
              '_id'
            ),
          },
        },
      ],
    });

    // 6. Sesiones completadas de la empresa este mes
    const completedSessionsThisMonth = await Meet.countDocuments({
      isCancelled: false,
      date: { $gte: startOfMonth, $lt: now },
      $or: [
        {
          clientId: {
            $in: await Profile.find({ enterprise: enterpriseId }).distinct(
              '_id'
            ),
          },
        },
        {
          coachId: {
            $in: await Profile.find({ enterprise: enterpriseId }).distinct(
              '_id'
            ),
          },
        },
      ],
    });

    // 7. Nuevos profiles de la empresa en los últimos 7 días
    const recentProfiles = await Profile.find({
      enterprise: enterpriseId,
      createdAt: { $gte: startOfWeek },
    })
      .populate('user', 'email')
      .populate('role', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. Estadísticas de rendimiento de la plataforma
    const platformStats = {
      conversionRate: {
        value: '8.2%',
        change: '+1.2%',
        positive: true,
      },
      avgSessionsPerUser: {
        value: '3.5',
        change: '+0.3',
        positive: true,
      },
      avgSessionTime: {
        value: '52 min',
        change: '+4 min',
        positive: true,
      },
      churnRate: {
        value: '12.8%',
        change: '-2.3%',
        positive: true,
      },
      monthlyRevenue: {
        value: '€24,580',
        change: '+€3,450',
        positive: true,
      },
    };

    // 9. Tickets pendientes de la empresa (tickets abiertos)
    const enterpriseUserIds = await Profile.find({
      enterprise: enterpriseId,
    }).distinct('user');
    const pendingReports = await Ticket.countDocuments({
      status: { $in: ['pending', 'in_progress'] },
      reporterUser: { $in: enterpriseUserIds },
    });

    const enterpriseBasicData = {
      totalUsers,
      newUsersThisMonth,
      activeCoaches,
      newCoachesThisMonth,
      completedSessions,
      completedSessionsThisMonth,
      recentUsers: recentProfiles.map(profile => ({
        name: profile.name,
        email: profile.user.email,
        type: profile.role.code,
        date: getRelativeDate(profile.createdAt),
      })),
      platformStats,
      pendingReports,
    };

    return NextResponse.json({
      success: true,
      data: enterpriseBasicData,
    });
  } catch (error) {
    console.error('Error obteniendo datos básicos de la empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener fechas relativas
function getRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Hoy';
  if (diffDays === 2) return 'Ayer';
  if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
  return `Hace ${diffDays - 1} días`;
}
