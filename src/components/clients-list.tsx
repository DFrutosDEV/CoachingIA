'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  MoreVertical,
  Calendar,
  MessageSquare,
  FileText,
  Filter,
  Ban,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { formatDate, formatTime } from '@/utils/validatesInputs';
import { DeleteClientModal } from '@/components/ui/delete-client-modal';
import { useTranslations } from 'next-intl';

import { ClientResponse, NextSession } from '@/types';
import { sendMessage } from '@/utils/wpp-methods';
import { sendEmail } from '@/utils/sendEmail';

// Definir props para ClientsList
interface ClientsListProps {
  clients: ClientResponse[];
  onClientSelect: (clientId: string) => void;
  isAdmin: boolean;
  onClientDeleted?: () => void; // Callback para refrescar la lista
}

export function ClientsList({
  clients,
  onClientSelect,
  isAdmin,
  onClientDeleted,
}: ClientsListProps) {
  const t = useTranslations('common.dashboard.clientsList');

  // Recibir props
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filtrar clientes basado en la búsqueda y el filtro de estado, usando la prop 'clients'
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.focus.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Resetear página si el filtro cambia y la página actual queda vacía
  if (currentPage * 5 >= filteredClients.length && currentPage > 0) {
    setCurrentPage(0);
  }

  const handleDeleteClick = (clientId: string, clientName: string) => {
    setSelectedClient({ id: clientId, name: clientName });
    setDeleteModalOpen(true);
  };

  const handleClientDeleted = () => {
    if (onClientDeleted) {
      onClientDeleted();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search.placeholder')}
              className="pl-8"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(0); // Reset page on search
              }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                {t('search.filter')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-accent" align="end">
              <DropdownMenuLabel>{t('search.status')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="bg-accent-hover"
                onClick={() => {
                  setStatusFilter('all');
                  setCurrentPage(0);
                }}
              >
                {t('search.all')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-accent-hover"
                onClick={() => {
                  setStatusFilter('active');
                  setCurrentPage(0);
                }}
              >
                {t('search.active')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-accent-hover"
                onClick={() => {
                  setStatusFilter('pending');
                  setCurrentPage(0);
                }}
              >
                {t('search.pending')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-accent-hover"
                onClick={() => {
                  setStatusFilter('inactive');
                  setCurrentPage(0);
                }}
              >
                {t('search.inactive')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.client')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.nextSession')}</TableHead>
                <TableHead></TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients
                  .slice(currentPage * 5, (currentPage + 1) * 5)
                  .map(client => (
                    <TableRow
                      key={client._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onClientSelect(client._id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {client.avatar && (
                            <Image
                              src={client.avatar}
                              alt={client.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {client.focus}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            client.status === 'active'
                              ? 'active'
                              : client.status === 'pending'
                                ? 'pending'
                                : 'inactive'
                          }
                        >
                          {client.status === 'active'
                            ? t('status.active')
                            : client.status === 'pending'
                              ? t('status.pending')
                              : t('status.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {Object.keys(client.nextSession).length > 0
                          ? `${formatDate(new Date((client.nextSession as NextSession).date))} - ${formatTime(new Date((client.nextSession as NextSession).date), { hour: '2-digit', minute: '2-digit' })}`
                          : t('table.toSchedule')}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="text"
                              size="icon"
                              onClick={e => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">{t('table.openMenu')}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="bg-accent"
                            align="end"
                          >
                            <DropdownMenuLabel>
                              {t('table.quickActions')}
                            </DropdownMenuLabel>
                            {isAdmin && (
                              <DropdownMenuItem
                                className="bg-accent-hover"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteClick(client._id, client.name);
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                <span>{t('table.deactivate')}</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="bg-accent-hover"
                              onClick={e => {
                                e.stopPropagation();
                                console.log('Mensaje', client._id);
                              }}
                            >
                              <div
                                className="flex items-center gap-2"
                                onClick={() =>
                                  client.phone
                                    ? sendMessage({ phone: client.phone })
                                    : sendEmail({ email: client.email })
                                }
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                {t('table.message')}
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="bg-accent-hover"
                              onClick={e => {
                                e.stopPropagation();
                                console.log('PDA', client._id);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              <span>{t('table.viewPDA')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {t('table.noClientsFound')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredClients.length > 5 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t('table.showingResults', {
                start: currentPage * 5 + 1,
                end: Math.min((currentPage + 1) * 5, filteredClients.length),
                total: filteredClients.length
              })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                {t('table.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={(currentPage + 1) * 5 >= filteredClients.length}
              >
                {t('table.next')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de confirmación para dar de baja */}
      {selectedClient && (
        <DeleteClientModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedClient(null);
          }}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          onClientDeleted={handleClientDeleted}
        />
      )}
    </Card>
  );
}
