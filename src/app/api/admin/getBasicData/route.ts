import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Profile from '@/models/Profile'
import Role from '@/models/Role'
import Meet from '@/models/Meet'
import Ticket from '@/models/Ticket'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'ID de administrador requerido' },
        { status: 400 }
      )
    }

    // Obtener roles para identificar tipos de usuario
    const roles = await Role.find({ active: true })
    
    const clientRole = roles.find(role => role.code === '3') // Client tiene código '3'
    const coachRole = roles.find(role => role.code === '2') // Coach tiene código '2'

    if (!clientRole || !coachRole) {
      return NextResponse.json(
        { success: false, error: 'Roles no encontrados' },
        { status: 500 }
      )
    }

    // Calcular fechas para filtros
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 1. Total de usuarios (todos los usuarios activos)
    const totalUsers = await User.countDocuments({ 
      active: true, 
      isDeleted: false 
    })

    // 2. Nuevos usuarios este mes
    const newUsersThisMonth = await User.countDocuments({
      active: true,
      isDeleted: false,
      createdAt: { $gte: startOfMonth }
    })

    // 3. Coaches activos
    const activeCoaches = await Profile.countDocuments({
      role: coachRole._id,
      isDeleted: false
    })

    // 4. Nuevos coaches este mes
    const newCoachesThisMonth = await Profile.countDocuments({
      role: coachRole._id,
      isDeleted: false,
      createdAt: { $gte: startOfMonth }
    })

    // 5. Sesiones completadas (no canceladas y en el pasado)
    const completedSessions = await Meet.countDocuments({
      isCancelled: false,
      date: { $lt: now }
    })

    // 6. Sesiones completadas este mes
    const completedSessionsThisMonth = await Meet.countDocuments({
      isCancelled: false,
      date: { $gte: startOfMonth, $lt: now }
    })

    // 7. Nuevos usuarios en los últimos 7 días
    const recentUsers = await User.aggregate([
      {
        $match: {
          active: true,
          isDeleted: false,
          createdAt: { $gte: startOfWeek }
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'user',
          as: 'profile'
        }
      },
      {
        $unwind: '$profile'
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'profile.role',
          foreignField: '_id',
          as: 'role'
        }
      },
      {
        $unwind: '$role'
      },
      {
        $project: {
          name: { $concat: ['$name', ' ', '$lastName'] },
          email: 1,
          type: '$role.name',
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      }
    ])

    // 8. Estadísticas de rendimiento de la plataforma
    const platformStats = {
      conversionRate: {
        value: '8.2%',
        change: '+1.2%',
        positive: true
      },
      avgSessionsPerUser: {
        value: '3.5',
        change: '+0.3',
        positive: true
      },
      avgSessionTime: {
        value: '52 min',
        change: '+4 min',
        positive: true
      },
      churnRate: {
        value: '12.8%',
        change: '-2.3%',
        positive: true
      },
      monthlyRevenue: {
        value: '€24,580',
        change: '+€3,450',
        positive: true
      }
    }

    // 9. Tickets pendientes (tickets abiertos)
    const pendingReports = await Ticket.countDocuments({
      status: { $in: ['pending', 'in_progress'] }
    })

    const adminBasicData = {
      totalUsers,
      newUsersThisMonth,
      activeCoaches,
      newCoachesThisMonth,
      completedSessions,
      completedSessionsThisMonth,
      recentUsers: recentUsers.map(user => ({
        name: user.name,
        email: user.email,
        type: user.type,
        date: getRelativeDate(user.createdAt)
      })),
      platformStats,
      pendingReports
    }

    return NextResponse.json({
      success: true,
      data: adminBasicData
    })

  } catch (error) {
    console.error('Error obteniendo datos básicos del admin:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para obtener fechas relativas
function getRelativeDate(date: Date): string {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - new Date(date).getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'Hoy'
  if (diffDays === 2) return 'Ayer'
  if (diffDays <= 7) return `Hace ${diffDays - 1} días`
  return `Hace ${diffDays - 1} días`
} 