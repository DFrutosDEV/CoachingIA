'use client';

import { useEffect, useState } from 'react';
import { EnterpriseCard } from './enterprise-card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Enterprise {
  _id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialMedia: string[];
  coaches: string[];
  employees: string[];
  active: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ServicesGrid() {
  const t = useTranslations('common.dashboard.enterprisesGrid');
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnterprises = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/enterprises');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error.loadEnterprises'));
      }

      setEnterprises(data.data || []);
    } catch (err) {
      console.error('Error fetching enterprises:', err);
      setError(err instanceof Error ? err.message : t('error.unknown'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterprises();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">{t('error.message', { error })}</p>
        <Button onClick={fetchEnterprises} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (enterprises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-muted-foreground">{t('noEnterprises')}</p>
        <Button onClick={fetchEnterprises} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('update')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('total', {
              count: enterprises.length,
              plural: enterprises.length !== 1 ? t('plural') : t('singular')
            })}
          </p>
        </div>
        <Button onClick={fetchEnterprises} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('update')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enterprises.map(enterprise => (
          <EnterpriseCard
            key={enterprise._id}
            name={enterprise.name}
            VAT={enterprise.email} // Usando email como VAT temporalmente
            codigoFiscal={enterprise.phone} // Usando phone como código fiscal temporalmente
            status={enterprise.active ? t('status.active') : t('status.inactive')}
            cantidadCoaches={enterprise.coaches.length}
            cantidadClientes={enterprise.employees.length}
          />
        ))}
      </div>
    </div>
  );
}
