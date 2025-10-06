import { NextRequest, NextResponse } from 'next/server';
import ConfigForm from '@/models/ConfigForm';
import connectDB from '@/lib/mongodb';

// PUT /api/config-forms/[id] - Actualizar formulario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { title, isObligatory } = body;

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Título es requerido',
        },
        { status: 400 }
      );
    }

    const updatedForm = await ConfigForm.findByIdAndUpdate(
      id,
      { title, isObligatory },
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formulario no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedForm,
    });
  } catch (error) {
    console.error('Error al actualizar formulario:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/config-forms/[id] - Actualizar parcialmente (ej: cambiar estado activo)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const updatedForm = await ConfigForm.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedForm) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formulario no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedForm,
    });
  } catch (error) {
    console.error('Error al actualizar formulario:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/config-forms/[id] - Eliminar formulario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const deletedForm = await ConfigForm.findByIdAndDelete(id);

    if (!deletedForm) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formulario no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Formulario eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar formulario:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
