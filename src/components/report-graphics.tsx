'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ReportGraphics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráficos de Tendencia</CardTitle>
        <CardDescription>
          Visualización del rendimiento a lo largo del tiempo (Próximamente).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground italic">
          Los gráficos detallados estarán disponibles pronto.
        </p>
        {/* Aquí iría la lógica y el JSX para los gráficos */}
      </CardContent>
    </Card>
  );
}
