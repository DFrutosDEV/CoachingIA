import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Profile from '@/models/Profile'
import Objective from '@/models/Objective'
import Meet from '@/models/Meet'
import Role from '@/models/Role'
import { generateJitsiLink } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      focus,
      startDate,
      startTime,
      coachId,
      userId, // Si se envía, es un usuario existente
    } = body

    // Validaciones básicas
    if (!focus || !startDate || !startTime || !coachId) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos: focus, startDate, startTime, coachId'
      }, { status: 400 })
    }

    // Obtener el ID del rol de cliente
    const clientRole = await Role.findOne({ code: '3' })
    if (!clientRole) {
      return NextResponse.json({
        success: false,
        error: 'Rol de cliente no encontrado en la base de datos'
      }, { status: 500 })
    }

    let clientId: string

    // Si no se envía userId, crear nuevo usuario
    if (!userId) {
      if (!firstName || !lastName || !email) {
        return NextResponse.json({
          success: false,
          error: 'Para crear un nuevo usuario se requieren: firstName, lastName, email'
        }, { status: 400 })
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'Ya existe un usuario con este email'
        }, { status: 400 })
      }

      // Crear nuevo usuario
      const newUser = new User({
        name: firstName,
        lastName,
        email,
        phone: phone || '',
        password: 'tempPassword123', //! Contraseña temporal, el usuario deberá cambiarla en su primer login
        active: true,
        firstLogin: true,
        isDeleted: false
      })

      const savedUser = await newUser.save()
      clientId = savedUser._id.toString()

      // Crear perfil para el nuevo usuario
      const newProfile = new Profile({
        user: savedUser._id,
        role: clientRole._id,
        isDeleted: false
      })

      await newProfile.save()

    } else {
      // Usar el userId existente
      clientId = userId
    }

    // Verificar que el coach existe
    const coach = await User.findById(coachId)
    if (!coach) {
      return NextResponse.json({
        success: false,
        error: 'Coach no encontrado'
      }, { status: 404 })
    }

    // Obtener el perfil del coach
    const coachProfile = await Profile.findOne({ user: coachId })
    if (!coachProfile) {
      return NextResponse.json({
        success: false,
        error: 'Perfil del coach no encontrado'
      }, { status: 404 })
    }

    // Obtener el perfil del cliente
    const clientProfile = await Profile.findOne({ user: clientId })
    if (!clientProfile) {
      return NextResponse.json({
        success: false,
        error: 'Perfil del cliente no encontrado'
      }, { status: 404 })
    }

    // Verificar si el cliente ya está en el array de clients del coach
    const isClientAlreadyAssigned = coachProfile.clients.some(
      (client: any) => client.toString() === clientProfile._id.toString()
    )

    // Si no está asignado, agregarlo al array de clients del coach
    if (!isClientAlreadyAssigned) {
      coachProfile.clients.push(clientProfile._id)
      await coachProfile.save()
    }

    // Crear el objetivo
    const newObjective = new Objective({
      title: focus,
      createdBy: coachId,
      clientId,
      coachId,
      isCompleted: false
    })

    const savedObjective = await newObjective.save()

    // Crear la fecha combinando startDate y startTime
    const [year, month, day] = startDate.split('-')
    const [hours, minutes] = startTime.split(':')
    const meetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes))

    // Crear el link de Jitsi Meet
    const meetLink = generateJitsiLink(startDate, startTime, clientId, coachId)

    // Crear la reunión
    const newMeet = new Meet({
      date: meetDate,
      time: startTime,
      link: meetLink,
      createdBy: coachId,
      clientId,
      coachId,
      objectiveId: savedObjective._id,
      isCancelled: false
    })

    const savedMeet = await newMeet.save()

    return NextResponse.json({
      success: true,
      message: 'Objetivo y reunión creados exitosamente',
      data: {
        objective: savedObjective,
        meet: savedMeet,
        clientId,
        isNewUser: !userId
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/objective:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
