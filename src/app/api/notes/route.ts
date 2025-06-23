import { NextRequest, NextResponse } from 'next/server'
import Note from '@/models/Note'
import User from '@/models/User'
import Meet from '@/models/Meet'
import connectDB from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { destinatario, sesion, titulo, contenido, clienteId, coachId } = body

    // Validar campos requeridos
    if (!destinatario || !sesion || !titulo || !contenido || !clienteId || !coachId) {
      return NextResponse.json({
        success: false,
        error: 'Todos los campos son requeridos: destinatario, sesion, titulo, contenido, clienteId, coachId'
      }, { status: 400 })
    }

    // Verificar que el destinatario existe
    const destinatarioUser = await User.findById(destinatario)
    if (!destinatarioUser) {
      return NextResponse.json({
        success: false,
        error: 'El destinatario no existe'
      }, { status: 404 })
    }

    // Verificar que la sesión existe
    const sesionMeet = await Meet.findById(sesion)
    if (!sesionMeet) {
      return NextResponse.json({
        success: false,
        error: 'La sesión no existe'
      }, { status: 404 })
    }

    // Verificar que el cliente existe
    const clienteUser = await User.findById(clienteId)
    if (!clienteUser) {
      return NextResponse.json({
        success: false,
        error: 'El cliente no existe'
      }, { status: 404 })
    }

    // Verificar que el coach existe
    const coachUser = await User.findById(coachId)
    if (!coachUser) {
      return NextResponse.json({
        success: false,
        error: 'El coach no existe'
      }, { status: 404 })
    }

    // Crear la nota
    const newNote = new Note({
      title: titulo,
      content: contenido,
      destinatario,
      sesion,
      clienteId,
      coachId,
      createdBy: coachId // Asumiendo que el coach es quien crea la nota
    })

    await newNote.save()

    // Popular los datos para la respuesta
    await newNote.populate([
      { path: 'destinatario', select: 'name lastName email' },
      { path: 'sesion', select: 'date time' },
      { path: 'clienteId', select: 'name lastName email' },
      { path: 'coachId', select: 'name lastName email' },
      { path: 'createdBy', select: 'name lastName email' }
    ])

    return NextResponse.json({
      success: true,
      message: 'Nota creada exitosamente',
      note: newNote
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando nota:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const url = new URL(request.url)
    const coachId = url.searchParams.get('coachId')
    const clienteId = url.searchParams.get('clienteId')
    const sesion = url.searchParams.get('sesion')

    let filter: any = { isDeleted: false }

    if (coachId) filter.coachId = coachId
    if (clienteId) filter.clienteId = clienteId
    if (sesion) filter.sesion = sesion

    const notes = await Note.find(filter)
      .populate('destinatario', 'name lastName email')
      .populate('sesion', 'date time')
      .populate('clienteId', 'name lastName email')
      .populate('coachId', 'name lastName email')
      .populate('createdBy', 'name lastName email')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      notes
    })

  } catch (error) {
    console.error('Error obteniendo notas:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
} 