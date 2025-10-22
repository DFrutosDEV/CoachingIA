'use client';

import React from 'react';
import { register } from '../app/[locale]/register-sw';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    register();
  }, []);

  return <>{children}</>;
}
