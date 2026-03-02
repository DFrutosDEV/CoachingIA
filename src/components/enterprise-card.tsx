'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
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
  points?: number;
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
  points = 0,
}: EnterpriseCardProps) {
  const t = useTranslations('common.dashboard.enterpriseCard');

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-3">
          {logo ? (
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={logo}
                alt={name}
                width={40}
                height={40}
                className="object-contain"
              />
            </span>
          ) : null}
          <span>{name}</span>
        </CardTitle>
        <CardDescription>{t('administrator', { administrator })}</CardDescription>
        <CardDescription>{t('email', { email })}</CardDescription>
        <CardDescription>{t('phone', { phone })}</CardDescription>
        <CardDescription>
          {t('coachesAndCoachees', {
            coaches: coaches,
            coachees: coachees,
          })}
        </CardDescription>
        <CardDescription>{t('points', { points })}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant={isActive ? 'active' : 'inactive'}>{status}</Badge>
      </CardContent>
    </Card>
  );
}
