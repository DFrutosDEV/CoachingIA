import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Objective from "@/models/Objective";
import Meet from "@/models/Meet";
import { formatDate } from "@/utils/validatesInputs";
import Goal from "@/models/Goal";
import Note from "@/models/Note";
import { ClientResponse } from "@/types";

// GET /api/coach/clients - Obtener clientes de un coach
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    
    if (!coachId) {
      return NextResponse.json(
        { error: 'Coach ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el coach existe y obtener su perfil
    const coach = await User.findById(coachId);
    if (!coach) {
      return NextResponse.json(
        { error: 'Coach no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el perfil del coach
    const coachProfile = await Profile.findOne({ user: coachId, isDeleted: false })
    .populate({
      path: 'clients',
      model: Profile,
      match: { isDeleted: false },
      populate: {
        path: 'user',
        model: User,
        select: 'name lastName email phone active isDeleted createdAt'
      }
    });
    
    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Perfil del coach no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si hay clientes
    if (!coachProfile.clients || coachProfile.clients.length === 0) {
      return NextResponse.json({
        success: true,
        clients: [],
        message: 'No hay clientes asignados a este coach'
      });
    }

    // Transformar los datos para que coincidan con la estructura esperada en el frontend
    const clients = await Promise.all(coachProfile.clients.map(async (clientProfile: any) => {
      const clientUser = clientProfile.user;
      
      // Buscar el objetivo activo del cliente
      const activeObjective = await Objective.findOne({
        coachId: coachProfile._id,
        clientId: clientProfile._id, 
        active: true,
        isCompleted: false 
      });

      // Buscar metas del objetivo activo del cliente
      let goals: any[] = [];
      if (activeObjective) {
        goals = await Goal.find({
          objectiveId: activeObjective._id,
          isDeleted: false
        }).select('description isCompleted day');
      }

      // Buscar notas del cliente
      const notes = await Note.find({
        clientId: clientProfile._id,
        isDeleted: false
      });

      // Buscar siguientes sesiones del cliente
      const upcomingSessions = await Meet.find({
        clientId: clientProfile._id,
        coachId: coachProfile._id,
        date: { $gte: new Date() },
        isCancelled: false
      }).sort({ date: 1 }).select('date link objectiveId');

      // Buscar sesiones completadas (meets que ya pasaron y no están canceladas)
      const completedSessions = await Meet.countDocuments({
        clientId: clientProfile._id, 
        coachId: coachProfile._id, 
        date: { $lt: new Date() }, // Sesiones que ya pasaron
        isCancelled: false
      });

      // Buscar la próxima sesión (meet más cercana a hoy que no esté cancelada)
      const nextSession = await Meet.findOne({
        clientId: clientProfile._id, 
        coachId: coachProfile._id, 
        date: { $gte: new Date() }, // Sesiones futuras o de hoy
        isCancelled: false

      }).sort({ date: 1 }).select('date link objectiveId').populate('objectiveId'); // Ordenar por fecha y hora ascendente

      // Buscar la última sesión (meet más reciente que ya pasó y no está cancelada)
      const lastSession = await Meet.findOne({
        clientId: clientProfile._id, 
        coachId: coachProfile._id, 
        date: { $lt: new Date() }, // Sesiones que ya pasaron
        isCancelled: false
      }).sort({ date: -1 }).select('date link objectiveId').populate('objectiveId'); // Ordenar por fecha y hora descendente

      return {
        _id: clientUser._id.toString(),
        profileId: clientProfile._id.toString(),
        name: `${clientUser.name} ${clientUser.lastName}`,
        email: clientUser.email,
        phone: clientUser.phone,
        startDate: formatDate(new Date(clientUser.createdAt)),
        sessions: completedSessions,
        nextSession: nextSession ? {
          date: nextSession.date,
          time: nextSession.time,
          link: nextSession.link,
          objective: nextSession.objectiveId
        } : {},
        lastSession: lastSession ? {
          date: lastSession.date,
          time: lastSession.time,
          link: lastSession.link,
          objective: lastSession.objectiveId
        } : {},
        progress: goals.length > 0 ? (goals.filter((goal: any) => goal.isCompleted).length / goals.length) * 100 : 0,
        status: clientUser.active ? 'active' : 'inactive',
        focus: activeObjective?.title || 'Sin objetivo',
        avatar: clientProfile.profilePicture || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(clientUser.name + ' ' + clientUser.lastName)}`,
        bio: clientProfile.bio || 'Sin información',
        goals: goals,
        upcomingSessions: upcomingSessions,
        notes: notes,
        activeObjectiveId: activeObjective?._id?.toString() || null
      } as ClientResponse;
    }));

    return NextResponse.json({
      success: true,
      clients
    });

  } catch (error) {
    console.error('Error al obtener clientes del coach:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}