import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Definimos el tipo para un reporte individual para mejor type-safety
interface Report {
  id: number;
  title: string;
  reporterName: string;
  reporterEmail: string;
  reportDate: string;
  status: string;
}

// Props para el componente ReportUsers
interface ReportUsersProps {
  reports: Report[];
}

// Función auxiliar para obtener el estilo del badge según el estado
const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'en progreso': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case 'resuelto': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export function ReportUsers({ reports }: ReportUsersProps) {
  if (!reports || reports.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay reportes para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex flex-col items-start gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex-grow space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{report.title}</span>
            </div>
            <p className="pl-6 text-xs text-muted-foreground">
              Reportado por: {report.reporterName} ({report.reporterEmail})
            </p>
            <div className="flex items-center gap-2 pl-6 pt-1">
               <span
                 className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusBadgeStyle(report.status)}`}
               >
                 {report.status}
               </span>
              <span className="text-xs text-muted-foreground">{report.reportDate}</span>
            </div>
          </div>
           <div className="w-full flex-shrink-0 sm:w-auto">
               {/* <Link href={`/dashboard/admin/reports/${report.id}`} passHref> */}
                 <Button size="sm" variant="outline" className="w-full sm:w-auto">
                   Ver Reporte
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              {/* </Link> */}
           </div>
        </div>
      ))}
    </div>
  );
}
