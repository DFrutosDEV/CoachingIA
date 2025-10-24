'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function UnauthorizedPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('text.unauthorized');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md mb-0">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            {t('description')}
          </p>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('goBack')}
            </Button>

            <Button onClick={() => router.push(`/${locale}/login`)} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              {t('goToLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
