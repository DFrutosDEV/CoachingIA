'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@mui/material';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Ticket, ArrowRight } from 'lucide-react';

export function TicketCard() {
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketPriority, setTicketPriority] = useState('medium');

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">Generar Ticket</CardTitle>
        <CardDescription>
          Crea tickets para reportar problemas, solicitar soporte o enviar
          sugerencias al equipo técnico.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Reporta problemas técnicos</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Solicita nuevas funciones</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Recibe soporte personalizado</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogTrigger asChild>
            <Button variant="outlined" className="w-full">
              Crear Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Ticket de Soporte</DialogTitle>
              <DialogDescription>
                Describe el problema o solicitud para el equipo de soporte.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ticket-type">Tipo de Ticket</Label>
                <select
                  id="ticket-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="technical">Problema técnico</option>
                  <option value="billing">Facturación</option>
                  <option value="feature">Solicitud de función</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-subject">Asunto</Label>
                <Input id="ticket-subject" placeholder="Asunto del ticket" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-description">Descripción</Label>
                <Textarea
                  id="ticket-description"
                  placeholder="Describe el problema o solicitud en detalle..."
                  className="min-h-[120px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-priority">Prioridad</Label>
                <select
                  id="ticket-priority"
                  value={ticketPriority}
                  onChange={e => setTicketPriority(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outlined"
                onClick={() => setShowTicketDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => setShowTicketDialog(false)}>
                Enviar Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
