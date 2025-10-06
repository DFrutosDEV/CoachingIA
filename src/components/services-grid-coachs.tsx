'use client';

import { useEffect, useState } from 'react';
import { CoachCard } from './coach-card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface CoachResponse {
  id: string;
  name: string;
  lastName: string;
  email: string;
  age?: number;
  phone: string;
  bio: string;
  profilePicture?: string;
  active: boolean;
  enterprise?: {
    id: string;
    name: string;
    logo?: string;
  } | null;
  createdAt: string;
}

export function ServicesGrid() {
  const [coaches, setCoaches] = useState<CoachResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/coaches');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar coaches');
      }

      setCoaches(data.data || []);
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando coaches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={fetchCoaches} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (coaches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-muted-foreground">No hay coaches registrados</p>
        <Button onClick={fetchCoaches} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Coaches Registrados</h2>
          <p className="text-sm text-muted-foreground">
            Total: {coaches.length} coach{coaches.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Button onClick={fetchCoaches} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map(coach => (
          <CoachCard
            key={coach.id}
            id={coach.id}
            name={coach.name}
            lastName={coach.lastName}
            email={coach.email}
            age={coach.age}
            phone={coach.phone}
            bio={coach.bio}
            profilePicture={coach.profilePicture}
            active={coach.active}
            enterprise={coach.enterprise}
            createdAt={coach.createdAt}
          />
        ))}
      </div>
    </div>
  );
}
