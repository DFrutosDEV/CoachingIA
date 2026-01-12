'use client';

import { useEffect, useState } from 'react';
import { CoachCard } from './coach-card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import { CoachResponse } from '@/types';

export function ServicesGrid({ isEnterprise, isClient }: { isEnterprise?: boolean, isClient?: boolean }) {
  const t = useTranslations('common.dashboard.servicesGrid');
  const [coaches, setCoaches] = useState<CoachResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((state: RootState) => state.auth.user);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(isEnterprise ? `/api/enterprise/coaches?enterpriseId=${user?.enterprise?._id}` : isClient ? `/api/admin/coaches?clientId=${user?.profile?._id}` : '/api/admin/coaches');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error.loadCoaches'));
      }

      setCoaches(data.data || []);
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError(err instanceof Error ? err.message : t('error.unknown'));
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
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">{t('error.message', { error })}</p>
        <Button onClick={fetchCoaches} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (coaches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-muted-foreground">{isClient ? t('noCoachesDescription') : t('noCoaches')}</p>
        <Button onClick={fetchCoaches} variant="outline">
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
              count: coaches.length,
              plural: coaches.length !== 1 ? t('plural') : t('singular')
            })}
          </p>
        </div>
        <Button onClick={fetchCoaches} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('update')}
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
            points={coach.points}
            age={coach.age}
            phone={coach.phone}
            bio={coach.bio}
            profilePicture={coach.profilePicture}
            active={coach.active}
            enterprise={coach.enterprise}
            createdAt={coach.createdAt}
            onCoachUpdated={fetchCoaches}
          />
        ))}
      </div>
    </div>
  );
}
