import {
  FileText,
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Report } from '@/types';

// Props para el componente ReportUsers
interface ReportUsersProps {
  reports: Report[];
  onViewReport: (report: Report) => void;
  isLoading?: boolean;
}

// Función auxiliar para obtener el estilo del badge según el estado
const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'closed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getPriorityBadgeStyle = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'bug':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'suggestion':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'complaint':
      return <XCircle className="h-4 w-4 text-orange-500" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'in_progress':
      return 'En Progreso';
    case 'resolved':
      return 'Resuelto';
    case 'closed':
      return 'Cerrado';
    default:
      return status;
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'Crítica';
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Media';
    case 'low':
      return 'Baja';
    default:
      return priority;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Hace 1 día';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30)
    return `Hace ${Math.ceil(diffDays / 7)} semana${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function ReportUsers({
  reports,
  onViewReport,
  isLoading,
}: ReportUsersProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex flex-col items-start gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay reportes para mostrar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map(report => (
        <div
          key={report._id}
          className="flex flex-col items-start gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex-grow space-y-2">
            <div className="flex items-center gap-2">
              {getCategoryIcon(report.category)}
              <span className="text-sm font-medium">{report.title}</span>
            </div>
            <p className="pl-6 text-xs text-muted-foreground">
              Reportado por: {report.reporterName} ({report.reporterEmail})
            </p>
            <div className="flex items-center gap-2 pl-6 pt-1 flex-wrap">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusBadgeStyle(report.status)}`}
              >
                {getStatusText(report.status)}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getPriorityBadgeStyle(report.priority)}`}
              >
                {getPriorityText(report.priority)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(report.createdAt)}
              </span>
            </div>
            {report.description && (
              <p className="pl-6 text-xs text-muted-foreground line-clamp-2">
                {report.description.length > 100
                  ? `${report.description.substring(0, 100)}...`
                  : report.description}
              </p>
            )}
          </div>
          <div className="w-full flex-shrink-0 sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onViewReport(report)}
            >
              Ver Reporte
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
