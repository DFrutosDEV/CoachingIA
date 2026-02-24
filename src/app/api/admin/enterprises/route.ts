import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enterprise from '@/models/Enterprise';
import Profile from '@/models/Profile';
import User from '@/models/User';
import Role from '@/models/Role';

// GET /api/admin/enterprises - Obtener todas las empresas (opcional: ?search= para filtrar por nombre)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const query: { isDeleted: boolean; name?: RegExp } = { isDeleted: false };
    if (search && search.trim().length >= 2) {
      query.name = new RegExp(search.trim(), 'i');
    }

    const enterprises = await Enterprise.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const roleEnterpriseId = await Role.findOne({ code: '4' });
    const enterprisesWithAdministrator = await Promise.all(
      enterprises.map(async (enterprise: any) => {
        const coacheAdmin = await Profile.findOne({
          enterprise: enterprise._id,
          role: roleEnterpriseId._id,
        });
        return {
          ...enterprise,
          administrator: coacheAdmin
            ? `${coacheAdmin.name} ${coacheAdmin.lastName}`
            : '',
          points: enterprise.points ?? 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enterprisesWithAdministrator,
      count: enterprisesWithAdministrator.length,
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
      employees,
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
      isDeleted: false,
    });

    await newEnterprise.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Empresa creada correctamente',
        data: newEnterprise,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear empresa:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
