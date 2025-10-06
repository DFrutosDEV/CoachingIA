'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Ticket, ArrowRight } from 'lucide-react';

export function ConfigFormCard() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">
          Visualiza tu formulario de configuración
        </CardTitle>
        <CardDescription>
          Accede a tu formulario de configuración.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Visualiza tu formulario de configuración</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Descarga tu formulario de configuración</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Comparte tu formulario de configuración</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
