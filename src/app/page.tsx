'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getPreferredLocale, isValidLocale } from '@/utils/locale-storage';

// Esta página redirige automáticamente al locale preferido o por defecto
export default function RootPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Verificar si hay un locale preferido en localStorage
    const preferredLocale = getPreferredLocale();

    // Verificar si el locale preferido es válido
    const validLocale = isValidLocale(preferredLocale, [...routing.locales]);

    // Redirigir al locale preferido o al defaultLocale
    const targetLocale = validLocale ? preferredLocale! : routing.defaultLocale;

    // Pequeño delay para mostrar el loading
    const timer = setTimeout(() => {
      router.replace(`/${targetLocale}`);
      setIsRedirecting(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Mostrar un loading mientras se redirige
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}
