'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ReportUsers } from '@/components/report-users';
import { ReportDetailModal } from '@/components/ui/report-detail-modal';
import { FileText, Filter } from 'lucide-react';
import { Report } from '@/types';
import { useAppSelector } from '@/lib/redux/hooks';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function EnterpriseReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  const t = useTranslations('text.dashboardAdmin.reportsPage');

  // Cargar reportes
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...(user?.enterprise?._id && { enterpriseId: user.enterprise._id }),
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`/api/enterprise/reports?enterpriseId=${user?.enterprise?._id}&${params}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.data.reports);
        setFilteredReports(data.data.reports);
      } else {
        setError(data.error || t('errorLoadingReports'));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(t('connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...reports];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    setFilteredReports(filtered);
  }, [reports, statusFilter, categoryFilter, priorityFilter]);

  // Cargar reportes al montar el componente
  useEffect(() => {
    fetchReports();
  }, []);

  // Manejar vista de reporte
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Manejar respuesta a reporte
  const handleRespondToReport = async (reportId: string, response: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'respond',
          response,
          responseBy: user?._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Actualizar el reporte en la lista
        setReports(prev =>
          prev.map(report => (report._id === reportId ? data.data : report))
        );
        setSelectedReport(data.data);
      } else {
        throw new Error(data.error || t('errorResponding'));
      }
    } catch (error) {
      console.error('Error responding to report:', error);
      throw error;
    }
  };

  // Manejar cierre de reporte
  const handleCloseReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'close',
          closedBy: user?._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Actualizar el reporte en la lista
        setReports(prev =>
          prev.map(report => (report._id === reportId ? data.data : report))
        );
        setSelectedReport(data.data);
        setIsModalOpen(false);
      } else {
        throw new Error(data.error || t('errorClosing'));
      }
    } catch (error) {
      console.error('Error closing report:', error);
      throw error;
    }
  };

  // Manejar resolución de reporte
  const handleResolveReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resolve',
          resolvedBy: user?._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Actualizar el reporte en la lista
        setReports(prev =>
          prev.map(report => (report._id === reportId ? data.data : report))
        );
        setSelectedReport(data.data);
      } else {
        throw new Error(data.error || t('errorResolving'));
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="enterprise" className="h-full" />
      </div>
      <DashboardSidebar
        userType="enterprise"
        className="h-full bg-background"
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader
          userType="enterprise"
          onToggleSidebar={toggleMobileSidebar}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6" />
              <h1 className="text-lg font-semibold md:text-2xl">
                {t('title')}
              </h1>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('subtitle')}
          </p>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('filters')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('status')}</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all')}</SelectItem>
                      <SelectItem value="pending">{t('pending')}</SelectItem>
                      <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
                      <SelectItem value="resolved">{t('resolved')}</SelectItem>
                      <SelectItem value="closed">{t('closed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('category')}</label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allCategories')}</SelectItem>
                      <SelectItem value="bug">{t('bug')}</SelectItem>
                      <SelectItem value="suggestion">{t('suggestion')}</SelectItem>
                      <SelectItem value="complaint">{t('complaint')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('priority')}</label>
                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectPriority')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allPriorities')}</SelectItem>
                      <SelectItem value="critical">{t('critical')}</SelectItem>
                      <SelectItem value="high">{t('high')}</SelectItem>
                      <SelectItem value="medium">{t('medium')}</SelectItem>
                      <SelectItem value="low">{t('low')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de reportes */}
          <Card>
            <CardHeader>
              <CardTitle>{t('reports')} ({filteredReports.length})</CardTitle>
              <CardDescription>
                {isLoading
                  ? t('loadingReports')
                  : error
                    ? `Error: ${error}`
                    : `${t('showingReports')} ${filteredReports.length} ${t('of')} ${reports.length} ${t('reportsCount')}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-7">
              <ReportUsers
                reports={filteredReports}
                onViewReport={handleViewReport}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Modal de detalles del reporte */}
          <ReportDetailModal
            report={selectedReport}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onRespond={handleRespondToReport}
            onCloseReport={handleCloseReport}
            onResolve={handleResolveReport}
            currentUserId={user?._id || ''}
          />
        </main>
      </div>
    </div>
  );
}
