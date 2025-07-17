"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ClientsList } from "../../../../components/clients-list"
import { ClientDetail } from "../../../../components/client-detail"
import { Users } from "lucide-react"
import { Client, Goal } from "@/types"

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const selectedClient = clients?.find(client => client._id === selectedClientId) || null;

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="admin" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="admin" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">Clientes</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestiona y supervisa a los clientes registrados en la plataforma.
          </p>
          <ClientsList clients={clients || []} onClientSelect={handleClientSelect} />
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
