'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ClientsList } from '@/components/clients-list';
import { ClientDetail } from '@/components/client-detail';
import { toast } from 'sonner';
import { useAppSelector } from '@/lib/redux/hooks';
import { ClientResponse, Goal } from '@/types';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const t = useTranslations('text.dashboardAdmin.clientsPage');

  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      //! MOVER A UN MIDDLEWARE
      if (!isAuthenticated || !user?._id) {
        throw new Error(t('notAuthenticated'));
      }

      if (!user.roles.includes('admin')) {
        throw new Error(t('noAdminPermissions'));
      }

      const response = await fetch(`/api/admin/clients?adminId=${user._id}`);

      if (!response.ok) {
        throw new Error(t('errorLoading'));
      }

      const data = await response.json();

      if (data.success) {
        setClients(data.clients);
      } else {
        throw new Error(data.error || t('unknownError'));
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err instanceof Error ? err.message : t('unknownError'));
      toast.error(t('errorToast'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchClients();
    }
  }, [isAuthenticated, user]);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleUpdateClient = (clientId: string, updatedGoals: Goal[]) => {
    setClients(prevClients =>
      prevClients?.map(client =>
        client._id === clientId ? { ...client, goals: updatedGoals } : client
      )
    );
  };

  const selectedClient =
    clients?.find(client => client._id === selectedClientId) || null;

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="admin" className="h-full" />
      </div>
      <DashboardSidebar
        userType="admin"
        className="h-full bg-background"
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader
          userType="admin"
          onToggleSidebar={toggleMobileSidebar}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <Users className="h-6 w-6" />
                <h1 className="text-3xl font-bold">{t('title')}</h1>
              </div>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      {t('loading')}
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <button
                      onClick={fetchClients}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      {t('retry')}
                    </button>
                  </div>
                </div>
              ) : (
                <ClientsList
                  clients={clients || []}
                  onClientSelect={handleClientSelect}
                  isAdmin={true}
                  onClientDeleted={fetchClients}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <ClientDetail
        client={selectedClient}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        onUpdateClient={handleUpdateClient}
        isAdmin={true}
      />
    </div>
  );
}
