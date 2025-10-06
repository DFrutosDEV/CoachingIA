import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enterprise from '@/models/Enterprise';

// GET /api/admin/enterprises/stats - Obtener estadísticas de empresas
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener todas las empresas
    const enterprises = await Enterprise.find({ isDeleted: false });
    const total = enterprises.length;

    // Contar empresas activas e inactivas
    const active = enterprises.filter(enterprise => enterprise.active).length;
    const inactive = total - active;

    // Contar nuevas empresas (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newEnterprises = enterprises.filter(
      enterprise => new Date(enterprise.createdAt) >= thirtyDaysAgo
    ).length;

    // Calcular total de empleados y promedio por empresa
    const totalEmployees = enterprises.reduce((sum, enterprise) => {
      return sum + (enterprise.employees ? enterprise.employees.length : 0);
    }, 0);

    const averageEmployeesPerEnterprise =
      total > 0 ? Math.round((totalEmployees / total) * 100) / 100 : 0;

    const stats = {
      total,
      active,
      inactive,
      newEnterprises,
      totalEmployees,
      averageEmployeesPerEnterprise,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de empresas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
