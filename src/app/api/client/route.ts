import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';

// POST /api/client - Crear un nuevo cliente //! SIN USAR
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      coachId,
      createdBy, // ID del usuario que está creando el cliente (coach, admin o enterprise)
    } = body;

    // Validaciones básicas
    if (!firstName || !lastName || !email || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Los campos firstName, lastName, email y createdBy son requeridos',
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
          error: 'Ya existe un usuario con este email',
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
          error: 'Rol de cliente no encontrado',
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
          error: 'Coach no encontrado',
        },
        { status: 404 }
      );
    }

    // Usar contraseña por defecto
    const defaultPassword = '!Password1';

    // Crear nuevo cliente
    const nuevoCliente = new User({
      email: email.toLowerCase(),
      password: defaultPassword,
      firstLogin: false,
      active: true,
      isDeleted: false,
    });

    const clienteGuardado = await nuevoCliente.save();

    // Actualizar el coach para incluir al nuevo cliente
    await User.findByIdAndUpdate(
      assignedCoachId,
      { $addToSet: { clients: clienteGuardado._id } },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          client: {
            name: clienteGuardado.name,
            lastName: clienteGuardado.lastName,
            email: clienteGuardado.email,
            phone: clienteGuardado.phone,
            active: clienteGuardado.active,
            createdAt: clienteGuardado.createdAt,
          },
        },
        message: 'Cliente creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creando cliente:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          details: errores,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
