'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PointsCardProps {
  count: number;
}

export function PointsCard({ count }: PointsCardProps) {
  const t = useTranslations('common.dashboard.points');

  // Determinar el estado de los puntos
  const getPointsStatus = () => {
    if (count <= 0) {
      return {
        status: 'empty',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: Minus,
        message: t('messages.empty'),
      };
    } else if (count <= 3) {
      return {
        status: 'low',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: TrendingDown,
        message: t('messages.low'),
      };
    } else {
      return {
        status: 'good',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: TrendingUp,
        message: t('messages.good'),
      };
    }
  };

  const pointsStatus = getPointsStatus();
  const StatusIcon = pointsStatus.icon;

  return (
    <Card data-swapy-item="scheduled-sessions" className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="flex flex-col">
          <div className="text-2xl font-bold">{count}</div>
          <p className="text-xs text-muted-foreground">{t('availablePoints')}</p>
        </div>
        <Badge
          variant="outline"
          className={`${pointsStatus.bgColor} ${pointsStatus.borderColor} ${pointsStatus.color} mt-2`}
        >
          <StatusIcon className="h-3 w-3 mr-1" /> {pointsStatus.message}
        </Badge>
      </CardContent>
    </Card>
  );
}
