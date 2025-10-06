import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();

    const report: any = await Ticket.findById(id)
      .populate('reporterUser', 'name email')
      .populate('assignedTo', 'name email')
      .populate('responseBy', 'name email')
      .populate('closedBy', 'name email')
      .lean();

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    const formattedReport = {
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
      closedByName: report.closedBy?.name,
    };

    return NextResponse.json({
      success: true,
      data: formattedReport,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();

    const body = await request.json();
    const { action, ...updateData } = body;

    const report = await Ticket.findById(id);
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    let updatedReport;

    switch (action) {
      case 'respond':
        const { response, responseBy } = updateData;

        if (!response || !responseBy) {
          return NextResponse.json(
            { success: false, error: 'Respuesta y usuario requeridos' },
            { status: 400 }
          );
        }

        // Verificar que el usuario existe
        const responder = await User.findById(responseBy);
        if (!responder) {
          return NextResponse.json(
            { success: false, error: 'Usuario no encontrado' },
            { status: 404 }
          );
        }

        updatedReport = await Ticket.findByIdAndUpdate(
          id,
          {
            response,
            responseBy,
            responseDate: new Date(),
            status: 'in_progress',
            updatedAt: new Date(),
          },
          { new: true }
        ).populate('responseBy', 'name email');

        break;

      case 'close':
        const { closedBy } = updateData;

        if (!closedBy) {
          return NextResponse.json(
            { success: false, error: 'Usuario requerido para cerrar' },
            { status: 400 }
          );
        }

        // Verificar que el usuario existe
        const closer = await User.findById(closedBy);
        if (!closer) {
          return NextResponse.json(
            { success: false, error: 'Usuario no encontrado' },
            { status: 404 }
          );
        }

        updatedReport = await Ticket.findByIdAndUpdate(
          id,
          {
            status: 'closed',
            closedBy,
            closedAt: new Date(),
            updatedAt: new Date(),
          },
          { new: true }
        ).populate('closedBy', 'name email');

        break;

      case 'resolve':
        const { resolvedBy } = updateData;

        if (!resolvedBy) {
          return NextResponse.json(
            { success: false, error: 'Usuario requerido para resolver' },
            { status: 400 }
          );
        }

        // Verificar que el usuario existe
        const resolver = await User.findById(resolvedBy);
        if (!resolver) {
          return NextResponse.json(
            { success: false, error: 'Usuario no encontrado' },
            { status: 404 }
          );
        }

        updatedReport = await Ticket.findByIdAndUpdate(
          id,
          {
            status: 'resolved',
            updatedAt: new Date(),
          },
          { new: true }
        );

        break;

      case 'assign':
        const { assignedTo } = updateData;

        if (assignedTo) {
          // Verificar que el usuario existe
          const assignee = await User.findById(assignedTo);
          if (!assignee) {
            return NextResponse.json(
              { success: false, error: 'Usuario asignado no encontrado' },
              { status: 404 }
            );
          }
        }

        updatedReport = await Ticket.findByIdAndUpdate(
          id,
          {
            assignedTo: assignedTo || null,
            updatedAt: new Date(),
          },
          { new: true }
        ).populate('assignedTo', 'name email');

        break;

      case 'update_status':
        const { status } = updateData;

        if (
          !status ||
          !['pending', 'in_progress', 'resolved', 'closed'].includes(status)
        ) {
          return NextResponse.json(
            { success: false, error: 'Estado inválido' },
            { status: 400 }
          );
        }

        updatedReport = await Ticket.findByIdAndUpdate(
          id,
          {
            status,
            updatedAt: new Date(),
          },
          { new: true }
        );

        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        );
    }

    if (!updatedReport) {
      return NextResponse.json(
        { success: false, error: 'Error al actualizar el reporte' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: updatedReport._id.toString(),
        title: updatedReport.title,
        description: updatedReport.description,
        category: updatedReport.category,
        priority: updatedReport.priority,
        status: updatedReport.status,
        reporterUser: updatedReport.reporterUser.toString(),
        reporterName: updatedReport.reporterName,
        reporterEmail: updatedReport.reporterEmail,
        reporterPhone: updatedReport.reporterPhone,
        assignedTo: updatedReport.assignedTo?.toString(),
        assignedToName: updatedReport.assignedTo?.name,
        response: updatedReport.response,
        responseBy: updatedReport.responseBy?.toString(),
        responseByName: updatedReport.responseBy?.name,
        responseDate: updatedReport.responseDate?.toISOString(),
        attachments: updatedReport.attachments || [],
        createdAt: updatedReport.createdAt.toISOString(),
        updatedAt: updatedReport.updatedAt.toISOString(),
        closedAt: updatedReport.closedAt?.toISOString(),
        closedBy: updatedReport.closedBy?.toString(),
        closedByName: updatedReport.closedBy?.name,
      },
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();

    const report = await Ticket.findById(id);
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    await Ticket.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Reporte eliminado correctamente',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
