import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import Objective from '@/models/Objective';
import Meet from '@/models/Meet';

// POST /api/clients - Crear un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      focus, 
      startDate, 
      startTime, 
      coachId,
      createdBy // ID del usuario que está creando el cliente (coach, admin o enterprise)
    } = body;
    
    // Validaciones básicas
    if (!firstName || !lastName || !email || !phone || !focus || !startDate || !startTime || !createdBy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Todos los campos son requeridos' 
        },
        { status: 400 }
      );
    }
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un usuario con este email' 
        },
        { status: 409 }
      );
    }
    
    // Obtener el rol de cliente
    const clientRole = await Role.findOne({ code: 'CLIENT' });
    if (!clientRole) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rol de cliente no encontrado' 
        },
        { status: 500 }
      );
    }
    
    // Determinar el coach asignado
    let assignedCoachId = coachId || createdBy;
    
    // Verificar que el coach existe
    const coach = await User.findById(assignedCoachId);
    if (!coach) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Coach no encontrado' 
        },
        { status: 404 }
      );
    }
    
    // Generar una contraseña temporal
    const tempPassword = `temp${Math.random().toString(36).substring(2, 15)}`;
    
    // Crear nuevo cliente
    const nuevoCliente = new User({
      name: firstName,
      lastName: lastName,
      email: email.toLowerCase(),
      phone: phone,
      password: tempPassword, // En un caso real, esto debería ser hasheado
      roles: [clientRole._id],
      biography: '',
      profilePicture: '',
      active: true,
      isDeleted: false,
      clients: [],
      coaches: [assignedCoachId],
      enterprises: []
    });
    
    const clienteGuardado = await nuevoCliente.save();
    
    // Actualizar el coach para incluir al nuevo cliente
    await User.findByIdAndUpdate(
      assignedCoachId,
      { $addToSet: { clients: clienteGuardado._id } },
      { new: true }
    );
    
    // Crear el objetivo inicial
    const nuevoObjetivo = new Objective({
      title: 'Objetivo inicial',
      description: focus,
      createdBy: assignedCoachId,
      clientId: clienteGuardado._id,
      isCompleted: false
    });
    
    const objetivoGuardado = await nuevoObjetivo.save();
    
    // Crear la primera reunión
    const fechaHora = new Date(`${startDate}T${startTime}`);
    
    const nuevaReunion = new Meet({
      date: fechaHora,
      time: startTime,
      link: `https://meet.example.com/room/${Math.random().toString(36).substring(2, 15)}`, // Link temporal
      createdBy: assignedCoachId,
      participants: [assignedCoachId, clienteGuardado._id],
      isCancelled: false
    });
    
    const reunionGuardada = await nuevaReunion.save();
    
    return NextResponse.json({
      success: true,
      data: {
        client: clienteGuardado,
        objective: objetivoGuardado,
        meeting: reunionGuardada
      },
      message: 'Cliente creado exitosamente con objetivo y reunión inicial'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creando cliente:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error de validación',
          details: errores
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 