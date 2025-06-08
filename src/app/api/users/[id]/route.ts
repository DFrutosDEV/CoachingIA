import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET /api/users/[id] - Obtener un usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de usuario inválido' 
        },
        { status: 400 }
      );
    }
    
    const usuario = await User.findById(id).select('-__v');
    
    if (!usuario) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Actualizar un usuario específico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    // Validar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de usuario inválido' 
        },
        { status: 400 }
      );
    }
    
    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (body.email) {
      const usuarioExistente = await User.findOne({ 
        email: body.email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (usuarioExistente) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Ya existe otro usuario con este email' 
          },
          { status: 409 }
        );
      }
      
      body.email = body.email.toLowerCase();
    }
    
    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      body,
      { 
        new: true, // Retornar el documento actualizado
        runValidators: true // Ejecutar validaciones del esquema
      }
    ).select('-__v');
    
    if (!usuarioActualizado) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: usuarioActualizado,
      message: 'Usuario actualizado exitosamente'
    });
    
  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    
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

// DELETE /api/users/[id] - Eliminar un usuario específico (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de usuario inválido' 
        },
        { status: 400 }
      );
    }
    
    // Soft delete: marcar como inactivo en lugar de eliminar
    const usuarioEliminado = await User.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    ).select('-__v');
    
    if (!usuarioEliminado) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: usuarioEliminado,
      message: 'Usuario eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
} 