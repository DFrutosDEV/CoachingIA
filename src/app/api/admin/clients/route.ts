import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Role from "@/models/Role";
import Goal from "@/models/Goal";
import Note from "@/models/Note";
import Meet from "@/models/Meet";

// Tipo simplificado para la respuesta del admin
interface AdminClientResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  sessions: number;
  nextSession: any;
  lastSession: any;
  progress: number;
  status: "active" | "pending" | "inactive";
  focus: string;
  avatar: string;
  bio: string;
  goals: any[];
  upcomingSessions: any[];
  notes: any[];
  activeObjectiveId: string | null;
}

// GET /api/admin/clients - Obtener todos los clientes para el admin
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el admin existe
    const admin = await User.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el rol de cliente
    const clientRole = await Role.findOne({ code: '3' });
    if (!clientRole) {
      return NextResponse.json(
        { error: 'Rol de cliente no encontrado' },
        { status: 500 }
      );
    }

    // Obtener todos los perfiles de clientes
    const clientProfiles = await Profile.find({ 
      role: clientRole._id, 
      isDeleted: false 
    }).populate({
      path: 'user',
      model: User,
      select: 'name lastName email phone active isDeleted createdAt'
    });

    if (!clientProfiles || clientProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        clients: [],
        message: 'No hay clientes registrados'
      });
    }

    // Obtener datos adicionales para cada cliente
    const clientsWithDetails: AdminClientResponse[] = await Promise.all(
      clientProfiles.map(async (profile) => {
        const userId = profile.user._id;
        
        // Obtener objetivos del cliente
        const goals = await Goal.find({ 
          user: userId, 
          isDeleted: false 
        }).sort({ createdAt: -1 });

        // Obtener notas del cliente
        const notes = await Note.find({ 
          user: userId, 
          isDeleted: false 
        }).sort({ createdAt: -1 }).limit(5);

        // Obtener reuniones del cliente
        const meets = await Meet.find({ 
          user: userId, 
          isDeleted: false 
        }).sort({ date: -1 }).limit(5);

        // Calcular estadísticas básicas
        const totalGoals = goals.length;
        const completedGoals = goals.filter(goal => goal.status === 'completed').length;
        const totalMeets = meets.length;
        const completedMeets = meets.filter(meet => !meet.isCancelled && new Date(meet.date) < new Date()).length;
        const progress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        // Obtener próxima sesión
        const nextSession = meets.find(meet => !meet.isCancelled && new Date(meet.date) > new Date()) || {};

        return {
          _id: userId,
          name: `${profile.user.name} ${profile.user.lastName}`,
          email: profile.user.email,
          phone: profile.user.phone,
          startDate: profile.user.createdAt.toISOString(),
          sessions: totalMeets,
          nextSession: nextSession,
          lastSession: meets.find(meet => !meet.isCancelled && new Date(meet.date) < new Date()) || {},
          progress,
          status: profile.user.active ? "active" : "inactive",
          focus: profile.bio || 'Sin enfoque definido',
          avatar: profile.avatar || '',
          bio: profile.bio || '',
          goals: goals.map(goal => ({
            _id: goal._id,
            description: goal.title || goal.description,
            isCompleted: goal.status === 'completed',
            day: goal.dueDate ? new Date(goal.dueDate).toISOString() : ''
          })),
          upcomingSessions: meets
            .filter(meet => !meet.isCancelled && new Date(meet.date) > new Date())
            .map(meet => ({
              _id: meet._id,
              date: meet.date,
              link: meet.link || '',
              objective: { title: meet.title || 'Sesión' }
            })),
          notes: notes.map(note => ({
            _id: note._id,
            content: note.content,
            createdBy: note.createdBy || userId,
            createdAt: note.createdAt.toISOString()
          })),
          activeObjectiveId: null
        };
      })
    );

    return NextResponse.json({
      success: true,
      clients: clientsWithDetails,
      total: clientsWithDetails.length
    });

  } catch (error) {
    console.error('Error obteniendo clientes para admin:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 