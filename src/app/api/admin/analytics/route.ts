import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Profile from '@/models/Profile'
import Role from '@/models/Role'
import Meet from '@/models/Meet'
import Enterprise from '@/models/Enterprise'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Obtener el token del header Authorization
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticación requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Decodificar el token para obtener información del usuario
    try {
      const decoded = JSON.parse(atob(token))
      const adminId = decoded.email // Usar email como identificador temporal
      
      if (!adminId) {
        return NextResponse.json(
          { success: false, error: 'Token inválido' },
          { status: 401 }
        )
      }

      // Obtener roles para identificar tipos de usuario
      const roles = await Role.find({ active: true })
      
      const clientRole = roles.find(role => role.code === '3') // Client tiene código '3'
      const coachRole = roles.find(role => role.code === '2') // Coach tiene código '2'
      const enterpriseRole = roles.find(role => role.code === '4') // Enterprise tiene código '4'

      if (!clientRole || !coachRole) {
        return NextResponse.json(
          { success: false, error: 'Roles no encontrados' },
          { status: 500 }
        )
      }

      // Calcular fechas para filtros
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      // 1. Cantidad de usuarios
      const totalUsers = await User.countDocuments({ 
        active: true, 
        isDeleted: false 
      })
      const totalUsersYesterday = await User.countDocuments({ 
        active: true, 
        isDeleted: false,
        createdAt: { $lt: yesterday }
      })
      const userChange = totalUsers - totalUsersYesterday

      // 2. Cantidad de coaches
      const totalCoaches = await Profile.countDocuments({
        role: coachRole._id,
        isDeleted: false
      })
      const totalCoachesYesterday = await Profile.countDocuments({
        role: coachRole._id,
        isDeleted: false,
        createdAt: { $lt: yesterday }
      })
      const coachChange = totalCoaches - totalCoachesYesterday

      // 3. Cantidad de empresas
      const totalEnterprises = await Enterprise.countDocuments({
        isDeleted: false
      })
      const totalEnterprisesYesterday = await Enterprise.countDocuments({
        isDeleted: false,
        createdAt: { $lt: yesterday }
      })
      const enterpriseChange = totalEnterprises - totalEnterprisesYesterday

      // 4. Cantidad de usuarios activos (que han tenido sesiones en el último mes)
      const activeUsers = await Meet.distinct('clientId', {
        date: { $gte: startOfMonth },
        isCancelled: false
      })
      const activeUsersCount = activeUsers.length
      const activeUsersLastMonth = await Meet.distinct('clientId', {
        date: { $gte: lastMonth, $lt: startOfMonth },
        isCancelled: false
      })
      const activeUsersChange = activeUsersCount - activeUsersLastMonth.length

      // 5. Cantidad de coaches activos (que han tenido sesiones en el último mes)
      const activeCoaches = await Meet.distinct('coachId', {
        date: { $gte: startOfMonth },
        isCancelled: false
      })
      const activeCoachesCount = activeCoaches.length
      const activeCoachesLastMonth = await Meet.distinct('coachId', {
        date: { $gte: lastMonth, $lt: startOfMonth },
        isCancelled: false
      })
      const activeCoachesChange = activeCoachesCount - activeCoachesLastMonth.length

      // 6. Cantidad de empresas activas (que tienen coaches activos)
      const activeEnterprises = await Enterprise.distinct('_id', {
        isDeleted: false,
        _id: { $in: await Profile.distinct('enterprise', { role: coachRole._id, isDeleted: false }) }
      })
      const activeEnterprisesCount = activeEnterprises.length
      const activeEnterprisesLastMonth = await Enterprise.distinct('_id', {
        isDeleted: false,
        createdAt: { $lt: startOfMonth },
        _id: { $in: await Profile.distinct('enterprise', { role: coachRole._id, isDeleted: false }) }
      })
      const activeEnterprisesChange = activeEnterprisesCount - activeEnterprisesLastMonth.length

      // 7. Cantidad de sesiones semanales
      const weeklySessions = await Meet.countDocuments({
        date: { $gte: startOfWeek },
        isCancelled: false
      })
      const weeklySessionsLastWeek = await Meet.countDocuments({
        date: { $gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000), $lt: startOfWeek },
        isCancelled: false
      })
      const weeklySessionsChange = weeklySessions - weeklySessionsLastWeek

      // 8. Cantidad de sesiones mensuales
      const monthlySessions = await Meet.countDocuments({
        date: { $gte: startOfMonth },
        isCancelled: false
      })
      const monthlySessionsLastMonth = await Meet.countDocuments({
        date: { $gte: lastMonth, $lt: startOfMonth },
        isCancelled: false
      })
      const monthlySessionsChange = monthlySessions - monthlySessionsLastMonth

      const analyticsData = [
        { 
          metric: "Cantidad de usuarios", 
          value: totalUsers.toString(), 
          change: userChange >= 0 ? `+${userChange}` : `${userChange}`, 
          positive: userChange >= 0, 
          period: "Ayer" 
        },
        { 
          metric: "Cantidad de coaches", 
          value: totalCoaches.toString(), 
          change: coachChange >= 0 ? `+${coachChange}` : `${coachChange}`, 
          positive: coachChange >= 0, 
          period: "Ayer" 
        },
        { 
          metric: "Cantidad de empresas", 
          value: totalEnterprises.toString(), 
          change: enterpriseChange >= 0 ? `+${enterpriseChange}` : `${enterpriseChange}`, 
          positive: enterpriseChange >= 0, 
          period: "Ayer" 
        },
        { 
          metric: "Cantidad de usuarios activos", 
          value: activeUsersCount.toString(), 
          change: activeUsersChange >= 0 ? `+${activeUsersChange}` : `${activeUsersChange}`, 
          positive: activeUsersChange >= 0, 
          period: "Ayer" 
        },
        { 
          metric: "Cantidad de coaches activos", 
          value: activeCoachesCount.toString(), 
          change: activeCoachesChange >= 0 ? `+${activeCoachesChange}` : `${activeCoachesChange}`, 
          positive: activeCoachesChange >= 0, 
          period: "Ayer" 
        },
        { 
          metric: "Cantidad de empresas activas", 
          value: activeEnterprisesCount.toString(), 
          change: activeEnterprisesChange >= 0 ? `+${activeEnterprisesChange}` : `${activeEnterprisesChange}`, 
          positive: activeEnterprisesChange >= 0, 
          period: "Ayer" 
        },
        { 
          metric: "Cantidad de sesiones semanales", 
          value: weeklySessions.toString(), 
          change: weeklySessionsChange >= 0 ? `+${weeklySessionsChange}` : `${weeklySessionsChange}`, 
          positive: weeklySessionsChange >= 0, 
          period: "Ayer" 
        },
        { 
          metric: "Cantidad de sesiones mensuales", 
          value: monthlySessions.toString(), 
          change: monthlySessionsChange >= 0 ? `+${monthlySessionsChange}` : `${monthlySessionsChange}`, 
          positive: monthlySessionsChange >= 0, 
          period: "Ayer" 
        },
      ]

      return NextResponse.json({
        success: true,
        data: analyticsData
      })

    } catch (decodeError) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Error obteniendo analíticas del admin:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 