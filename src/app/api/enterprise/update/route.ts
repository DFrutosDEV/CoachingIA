import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enterprise from '@/models/Enterprise';
import User from '@/models/User';
import Profile from '@/models/Profile';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      enterpriseId,
      name,
      logo,
      address,
      phone,
      email,
      website,
      socialMedia,
    } = body;

    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: 'ID de empresa requerido' },
        { status: 400 }
      );
    }

    // Verificar que la empresa existe
    const enterprise = await Enterprise.findById(enterpriseId);
    if (!enterprise || enterprise.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar los datos de la empresa
    const updatedEnterprise = await Enterprise.findByIdAndUpdate(
      enterpriseId,
      {
        name: name || enterprise.name,
        logo: logo || enterprise.logo,
        address: address || enterprise.address,
        phone: phone || enterprise.phone,
        email: email || enterprise.email,
        website: website || enterprise.website,
        socialMedia: socialMedia || enterprise.socialMedia,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedEnterprise,
      message: 'Empresa actualizada correctamente',
    });
  } catch (error) {
    console.error('Error actualizando empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const enterpriseId = searchParams.get('enterpriseId');

    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: 'ID de empresa requerido' },
        { status: 400 }
      );
    }

    // Obtener datos de la empresa
    const enterprise = await Enterprise.findById(enterpriseId);
    if (!enterprise || enterprise.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enterprise,
    });
  } catch (error) {
    console.error('Error obteniendo datos de la empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
