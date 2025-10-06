import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import User from '@/models/User';
import Role from '@/models/Role';
import Meet from '@/models/Meet';
import Ticket from '@/models/Ticket';
import Enterprise from '@/models/Enterprise';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener el enterpriseId del header o query params
    const enterpriseId = request.nextUrl.searchParams.get('enterpriseId');

    if (!enterpriseId) {
      return NextResponse.json(
        { error: 'Enterprise ID es requerido' },
        { status: 400 }
      );
    }

    // Obtener roles para filtrar por tipo
    const [clientRole, coachRole] = await Promise.all([
      Role.findOne({ code: '1' }),
      Role.findOne({ code: '2' }),
    ]);

    if (!clientRole || !coachRole) {
      return NextResponse.json(
        { error: 'Roles no encontrados' },
        { status: 500 }
      );
    }

    // Fechas para cálculos de períodos
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Obtener profiles de clientes de la empresa
    const [totalClients, newClientsThisMonth] = await Promise.all([
      Profile.countDocuments({
        enterprise: enterpriseId,
        role: clientRole._id,
        isDeleted: false,
      }),
      Profile.countDocuments({
        enterprise: enterpriseId,
        role: clientRole._id,
        isDeleted: false,
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    // 2. Obtener profiles de coaches de la empresa
    const [totalCoaches, newCoachesThisMonth] = await Promise.all([
      Profile.countDocuments({
        enterprise: enterpriseId,
        role: coachRole._id,
        isDeleted: false,
      }),
      Profile.countDocuments({
        enterprise: enterpriseId,
        role: coachRole._id,
        isDeleted: false,
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    // 3. Obtener sesiones completadas (meets no cancelados) de coaches/clientes de la empresa
    const enterpriseProfiles = await Profile.find({
      enterprise: enterpriseId,
      isDeleted: false,
    }).select('_id');

    const enterpriseProfileIds = enterpriseProfiles.map(profile => profile._id);

    const [totalSessions, sessionsThisMonth] = await Promise.all([
      Meet.countDocuments({
        $or: [
          { clientId: { $in: enterpriseProfileIds } },
          { coachId: { $in: enterpriseProfileIds } },
        ],
        isCancelled: false,
        date: { $lt: now }, // Solo sesiones que ya pasaron
      }),
      Meet.countDocuments({
        $or: [
          { clientId: { $in: enterpriseProfileIds } },
          { coachId: { $in: enterpriseProfileIds } },
        ],
        isCancelled: false,
        date: { $gte: startOfMonth, $lt: now },
      }),
    ]);

    // 4. Obtener reportes/tickets relacionados con usuarios de la empresa
    const enterpriseUsers = await Profile.find({
      enterprise: enterpriseId,
      isDeleted: false,
    }).populate('user', '_id');

    const enterpriseUserIds = enterpriseUsers
      .filter(profile => profile.user)
      .map(profile => profile.user._id);

    const pendingReports = await Ticket.countDocuments({
      reporterUser: { $in: enterpriseUserIds },
      status: { $in: ['pending', 'in_progress'] },
    });

    // 5. Obtener nuevos usuarios de la última semana con sus datos
    const newUsersData = await Profile.find({
      enterprise: enterpriseId,
      isDeleted: false,
      createdAt: { $gte: lastWeek },
    })
      .populate('user', 'email')
      .populate('role', 'code name')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedNewUsers = newUsersData.map(profile => ({
      name: `${profile.name} ${profile.lastName}`,
      email: profile.user.email,
      type: profile.role.code === '2' ? 'Coach' : 'Cliente',
      date: formatTimeAgo(profile.createdAt),
    }));

    // 6. Calcular estadísticas de rendimiento
    // Sesiones del mes pasado para comparar
    const sessionsLastMonth = await Meet.countDocuments({
      $or: [
        { clientId: { $in: enterpriseProfileIds } },
        { coachId: { $in: enterpriseProfileIds } },
      ],
      isCancelled: false,
      date: { $gte: lastMonth, $lt: startOfMonth },
    });

    // Clientes del mes pasado para comparar
    const clientsLastMonth = await Profile.countDocuments({
      enterprise: enterpriseId,
      role: clientRole._id,
      isDeleted: false,
      createdAt: { $lt: startOfMonth },
    });

    // Calcular cambios porcentuales
    const clientsChange =
      clientsLastMonth > 0
        ? ((newClientsThisMonth / clientsLastMonth) * 100).toFixed(1)
        : '0';

    const sessionsChange =
      sessionsLastMonth > 0
        ? (
            ((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) *
            100
          ).toFixed(1)
        : '0';

    // Calcular estadísticas adicionales
    const avgSessionsPerClient =
      totalClients > 0 ? (totalSessions / totalClients).toFixed(1) : '0';

    // Estadísticas simuladas (en una implementación real, estas vendrían de datos reales)
    const performanceStats = [
      {
        metric: 'Tasa de Conversión',
        value: '8.2%',
        change: '+1.2%',
        positive: true,
      },
      {
        metric: 'Sesiones Promedio por Cliente',
        value: avgSessionsPerClient,
        change: `+${sessionsChange}%`,
        positive: parseFloat(sessionsChange) >= 0,
      },
      {
        metric: 'Tiempo Promedio de Sesión',
        value: '52 min',
        change: '+4 min',
        positive: true,
      },
      {
        metric: 'Tasa de Abandono',
        value: '12.8%',
        change: '-2.3%',
        positive: true,
      },
      {
        metric: 'Crecimiento de Clientes',
        value: `${newClientsThisMonth}`,
        change: `+${clientsChange}%`,
        positive: parseFloat(clientsChange) >= 0,
      },
    ];

    const dashboardData = {
      // Cards pequeñas
      totalClients: {
        count: totalClients,
        change: newClientsThisMonth,
        changeText: `+${newClientsThisMonth} este mes`,
      },
      activeCoaches: {
        count: totalCoaches,
        change: newCoachesThisMonth,
        changeText: `+${newCoachesThisMonth} este mes`,
      },
      completedSessions: {
        count: totalSessions,
        change: sessionsThisMonth,
        changeText: `+${sessionsThisMonth} este mes`,
      },
      reports: {
        count: pendingReports,
        changeText: 'Pendientes de revisión',
      },

      // Cards grandes
      newUsers: formattedNewUsers,
      performanceStats,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error obteniendo datos del dashboard de enterprise:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función helper para formatear tiempo transcurrido
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 24) {
    return 'Hoy';
  } else if (diffInDays === 1) {
    return 'Ayer';
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  } else {
    return `Hace ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
  }
}
