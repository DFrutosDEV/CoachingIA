'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface EnterpriseCardProps {
  name: string;
  administrator: string;
  logo: string;
  address: string;
  email: string;
  phone: string;
  status: string;
  coaches: number;
  coachees: number;
  isActive: boolean;
}

export function EnterpriseCard({
  name,
  administrator,
  logo,
  address,
  email,
  phone,
  status,
  coaches,
  coachees,
  isActive,
}: EnterpriseCardProps) {
  const t = useTranslations('common.dashboard.enterpriseCard');

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{t('administrator', { administrator })}</CardDescription>
        <CardDescription>{t('email', { email })}</CardDescription>
        <CardDescription>{t('phone', { phone })}</CardDescription>
        <CardDescription>
          {t('coachesAndCoachees', {
            coaches: coaches,
            coachees: coachees,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant={isActive ? 'active' : 'inactive'}>{status}</Badge>
      </CardContent>
    </Card>
  );
}
