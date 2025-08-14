'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Report } from '@/types';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ReportDetailModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onRespond: (reportId: string, response: string) => Promise<void>;
  onCloseReport: (reportId: string) => Promise<void>;
  onResolve: (reportId: string) => Promise<void>;
  currentUserId: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'bug': return <AlertTriangle className="h-4 w-4" />;
    case 'suggestion': return <MessageSquare className="h-4 w-4" />;
    case 'complaint': return <XCircle className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function ReportDetailModal({ 
  report, 
  isOpen, 
  onClose, 
  onRespond, 
  onCloseReport, 
  onResolve, 
  currentUserId 
}: ReportDetailModalProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!report) return null;

  const handleRespond = async () => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onRespond(report._id, response);
      setResponse('');
    } catch (error) {
      console.error('Error responding to report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    setIsSubmitting(true);
    try {
      await onCloseReport(report._id);
    } catch (error) {
      console.error('Error closing report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    try {
      await onResolve(report._id);
    } catch (error) {
      console.error('Error resolving report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canTakeActions = report.status !== 'closed' && report.status !== 'resolved';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getCategoryIcon(report.category)}
            {report.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(report.status)}>
              {report.status === 'pending' && 'Pendiente'}
              {report.status === 'in_progress' && 'En Progreso'}
              {report.status === 'resolved' && 'Resuelto'}
              {report.status === 'closed' && 'Cerrado'}
            </Badge>
            <Badge className={getPriorityColor(report.priority)}>
              Prioridad: {report.priority === 'critical' && 'Crítica'}
              {report.priority === 'high' && 'Alta'}
              {report.priority === 'medium' && 'Media'}
              {report.priority === 'low' && 'Baja'}
            </Badge>
            <Badge variant="outline">
              {report.category === 'bug' && 'Error'}
              {report.category === 'suggestion' && 'Sugerencia'}
              {report.category === 'complaint' && 'Queja'}
              {report.category === 'other' && 'Otro'}
            </Badge>
          </div>

          {/* Información del reportero */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Información del Reportero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{report.reporterName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${report.reporterEmail}`} className="text-blue-600 hover:underline">
                  {report.reporterEmail}
                </a>
              </div>
              {report.reporterPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${report.reporterPhone}`} className="text-blue-600 hover:underline">
                    {report.reporterPhone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Reportado el {formatDate(report.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Descripción del reporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Descripción del Reporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.description}</p>
            </CardContent>
          </Card>

          {/* Respuesta existente */}
          {report.response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Respuesta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="whitespace-pre-wrap">{report.response}</p>
                {report.responseByName && report.responseDate && (
                  <div className="text-sm text-muted-foreground">
                    Respondido por {report.responseByName} el {formatDate(report.responseDate)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Formulario de respuesta */}
          {canTakeActions && !report.response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Responder al Reporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escribe tu respuesta aquí..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleRespond} 
                  disabled={!response.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
                </Button>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            {canTakeActions && (
              <>
                {report.status !== 'resolved' && (
                  <Button 
                    onClick={handleResolve} 
                    disabled={isSubmitting}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isSubmitting ? 'Procesando...' : 'Marcar como Resuelto'}
                  </Button>
                )}
                <Button 
                  onClick={handleClose} 
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <XCircle className="h-4 w-4" />
                  {isSubmitting ? 'Procesando...' : 'Cerrar Reporte'}
                </Button>
              </>
            )}
            <Button onClick={onClose} variant="outline">
              Cerrar Ventana
            </Button>
          </div>

          {/* Información adicional */}
          {(report.closedAt || report.updatedAt !== report.createdAt) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Historial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Última actualización: {formatDate(report.updatedAt)}
                </div>
                {report.closedAt && (
                  <div className="text-sm text-muted-foreground">
                    Cerrado el: {formatDate(report.closedAt)}
                    {report.closedByName && ` por ${report.closedByName}`}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
