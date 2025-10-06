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
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowRight, Coins } from 'lucide-react';
import { PointsManagerModal } from '@/components/ui/points-manager-modal';

export function PointsManagerCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Coins className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">Gestión de Puntos</CardTitle>
        <CardDescription>
          Administra los puntos de los coaches para la generación de objetivos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Asigna puntos a los coaches</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Saca puntos a los coaches</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Visualiza los puntos de los coaches</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outlined" className="w-full">
              Gestionar Puntos
            </Button>
          </DialogTrigger>
          <PointsManagerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
}
