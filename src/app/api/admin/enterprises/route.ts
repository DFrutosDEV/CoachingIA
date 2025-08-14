import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enterprise from '@/models/Enterprise';

// GET /api/admin/enterprises - Obtener todas las empresas
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener todas las empresas no eliminadas
    const enterprises = await Enterprise.find({ isDeleted: false })
      .sort({ createdAt: -1 }); // Ordenar por fecha de creación, más recientes primero

    return NextResponse.json({
      success: true,
      data: enterprises,
      count: enterprises.length
    });

  } catch (error) {
    console.error('Error al obtener empresas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/enterprises - Crear nueva empresa
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      name,
      logo,
      address,
      phone,
      email,
      website,
      socialMedia,
      coaches,
      employees
    } = body;

    // Validar campos requeridos
    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    // Crear nueva empresa
    const newEnterprise = new Enterprise({
      name,
      logo: logo || '',
      address: address || '',
      phone: phone || '',
      email: email || '',
      website: website || '',
      socialMedia: socialMedia || [],
      coaches: coaches || [],
      employees: employees || [],
      active: true,
      isDeleted: false
    });

    await newEnterprise.save();

    return NextResponse.json({
      success: true,
      message: 'Empresa creada correctamente',
      data: newEnterprise
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear empresa:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
