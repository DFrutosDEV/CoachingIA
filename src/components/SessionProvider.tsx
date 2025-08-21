'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Componente que restaura automáticamente la sesión al cargar la app
export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { restoreSession } = useAuth();

  useEffect(() => {
    // ✅ Restaurar sesión desde localStorage al cargar la app
    console.log('🔄 Restaurando sesión...');
    restoreSession();
  }, [restoreSession]);

  return <>{children}</>;
};
