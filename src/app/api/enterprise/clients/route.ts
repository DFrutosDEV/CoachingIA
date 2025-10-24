import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Role from '@/models/Role';
import Meet from '@/models/Meet';
import Objective from '@/models/Objective';
import Enterprise from '@/models/Enterprise';

// Tipo simplificado para la respuesta del admin
interface EnterpriseClientResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  sessions: number;
  nextSession: any;
  lastSession: any;
  status: 'active' | 'pending' | 'inactive';
  focus: string;
  avatar: string;
  bio: string;
  upcomingSessions: any[];
  activeObjectiveId: string | null;
}

// GET /api/enterprise/clients - Obtener todos los clientes para la empresa
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const enterpriseId = request.nextUrl.searchParams.get('enterpriseId');

    // Verificar que la empresa existe
    const enterprise = await Enterprise.findById(enterpriseId);
    if (!enterprise || enterprise.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada o eliminada' },
        { status: 400 }
      );
    }

    // Obtener el rol de cliente
    const clientRole = await Role.findOne({ code: '3' });
    if (!clientRole) {
      return NextResponse.json(
        { success: false, error: 'Rol de cliente no encontrado' },
        { status: 500 }
      );
    }

    // Obtener todos los perfiles de clientes
    const clientProfiles = await Profile.find({
      enterprise: enterprise._id,
      role: clientRole._id,
      isDeleted: false,
    }).populate({
      path: 'user',
      model: User,
      select: 'name lastName email phone active isDeleted createdAt',
    });

    if (!clientProfiles || clientProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        clients: [],
        message: 'No hay clientes registrados para esta empresa',
      });
    }

    // Obtener datos adicionales para cada cliente
    const clientsWithDetails: EnterpriseClientResponse[] = await Promise.all(
      clientProfiles.map(async profile => {
        const profileId = profile?._id;

        const objectives = await Objective.find({
          clientId: profileId,
          isDeleted: false,
        }).sort({ createdAt: -1 });

        const activeObjective = objectives.find(objective => objective.active);

        // Obtener reuniones del cliente
        const meets = await Meet.find({
          user: profileId,
          isDeleted: false,
        })
          .sort({ date: -1 })
          .limit(5);

        // Calcular estadísticas básicas
        const totalMeets = meets.length;

        // Obtener próxima sesión
        const nextSession =
          meets.find(
            meet => !meet.isCancelled && new Date(meet.date) > new Date()
          ) || {};

        return {
          _id: profile?.user?._id,
          profileId: profileId,
          name: `${profile.name} ${profile.lastName}`,
          email: profile.user.email,
          phone: profile.phone,
          startDate: profile.createdAt.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          sessions: totalMeets,
          nextSession: nextSession,
          lastSession:
            meets.find(
              meet => !meet.isCancelled && new Date(meet.date) < new Date()
            ) || {},
          status: profile.isDeleted ? 'inactive' : 'active',
          focus: activeObjective?.title || 'Sin enfoque definido',
          ...(profile.profilePicture && { avatar: profile.profilePicture }),
          bio: profile.bio || '',
          upcomingSessions: meets
            .filter(
              meet => !meet.isCancelled && new Date(meet.date) > new Date()
            )
            .map(meet => ({
              _id: meet._id,
              date: meet.date,
              link: meet.link || '',
              objective: { title: meet.title || 'Sesión' },
            })),
          activeObjectiveId: activeObjective?._id || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      clients: clientsWithDetails,
      total: clientsWithDetails.length,
    });
  } catch (error) {
    console.error('Error obteniendo clientes para empresa:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener clientes de la empresa',
      },
      { status: 500 }
    );
  }
}
