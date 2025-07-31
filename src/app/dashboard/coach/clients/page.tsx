"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ClientsList } from "../../../../components/clients-list"
import { ClientDetail } from "../../../../components/client-detail"
import { toast } from "sonner"
import { useAppSelector } from "@/lib/redux/hooks"
import { ClientResponse, Goal } from "@/types"

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAppSelector(state => state.auth.user)
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
  
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      //! MOVER A UN MIDDLEWARE
      if (!isAuthenticated || !user?._id) {
        throw new Error('Usuario no autenticado');
      }

      if (!user.roles.includes('coach')) {
        throw new Error('El usuario no tiene permisos de coach');
      }
      
      const response = await fetch(`/api/coach/clients?coachId=${user._id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener los clientes');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setClients(data.clients);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Ocurrio un error al cargar los clientes');
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
      prevClients.map(client =>
        client._id === clientId ? { ...client, goals: updatedGoals } : client
      )
    );
  };

  const selectedClient = clients.find(client => client._id === selectedClientId) || null;

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="coach" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="coach" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">Mis Clientes</h1>
              <p className="text-muted-foreground">Gestiona tus clientes y su progreso en el programa de coaching.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando clientes...</p>
                  </div>
                </div>
              ) : (
                <ClientsList clients={clients} onClientSelect={handleClientSelect} />
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
      />
    </div>
  )
}
