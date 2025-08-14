import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros
    const filters: any = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (category && category !== 'all') {
      filters.category = category;
    }
    if (priority && priority !== 'all') {
      filters.priority = priority;
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Construir sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Obtener reportes con paginación y filtros
    const reports = await Ticket.find(filters)
      .populate('reporterUser', 'name email')
      .populate('assignedTo', 'name email')
      .populate('responseBy', 'name email')
      .populate('closedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Contar total de reportes para paginación
    const totalReports = await Ticket.countDocuments(filters);
    const totalPages = Math.ceil(totalReports / limit);

    // Formatear datos para el frontend
    const formattedReports = reports.map((report: any) => ({
      _id: report._id.toString(),
      title: report.title,
      description: report.description,
      category: report.category,
      priority: report.priority,
      status: report.status,
      reporterUser: report.reporterUser?._id?.toString() || report.reporterUser,
      reporterName: report.reporterName,
      reporterEmail: report.reporterEmail,
      reporterPhone: report.reporterPhone,
      assignedTo: report.assignedTo?._id?.toString(),
      assignedToName: report.assignedTo?.name,
      response: report.response,
      responseBy: report.responseBy?._id?.toString(),
      responseByName: report.responseBy?.name,
      responseDate: report.responseDate?.toISOString(),
      attachments: report.attachments || [],
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      closedAt: report.closedAt?.toISOString(),
      closedBy: report.closedBy?._id?.toString(),
      closedByName: report.closedBy?.name
    }));

    return NextResponse.json({
      success: true,
      data: {
        reports: formattedReports,
        pagination: {
          currentPage: page,
          totalPages,
          totalReports,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      reporterUser,
      reporterName,
      reporterEmail,
      reporterPhone,
      attachments
    } = body;

    // Validaciones básicas
    if (!title || !description || !reporterUser || !reporterName || !reporterEmail) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await User.findById(reporterUser);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Crear nuevo reporte
    const newReport = new Ticket({
      title,
      description,
      category: category || 'other',
      priority: priority || 'medium',
      reporterUser,
      reporterName,
      reporterEmail,
      reporterPhone,
      attachments: attachments || []
    });

    const savedReport = await newReport.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: savedReport._id.toString(),
        title: savedReport.title,
        description: savedReport.description,
        category: savedReport.category,
        priority: savedReport.priority,
        status: savedReport.status,
        reporterUser: savedReport.reporterUser.toString(),
        reporterName: savedReport.reporterName,
        reporterEmail: savedReport.reporterEmail,
        reporterPhone: savedReport.reporterPhone,
        createdAt: savedReport.createdAt.toISOString(),
        updatedAt: savedReport.updatedAt.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
