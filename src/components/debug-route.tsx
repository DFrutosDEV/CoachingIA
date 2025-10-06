'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function DebugRoute() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    // Obtener datos del localStorage
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('persist:auth');
      const sessionData = localStorage.getItem('persist:session');

      setLocalStorageData({
        auth: authData ? JSON.parse(authData) : null,
        session: sessionData ? JSON.parse(sessionData) : null,
      });
    }
  }, []);

  const forceLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const goToLogin = () => {
    router.push('/login');
  };

  const goToDashboard = () => {
    if (user?.role?.name) {
      router.push(`/dashboard/${user.role.name.toLowerCase()}`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: '#1a1a1a',
        color: '#fff',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        border: '1px solid #333',
        maxWidth: '300px',
        maxHeight: '400px',
        overflow: 'auto',
      }}
    >
      <h4>🔍 Debug Route</h4>
      <div style={{ marginBottom: '10px' }}>
        <strong>Ruta actual:</strong> {pathname}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Autenticado:</strong> {isAuthenticated ? '✅' : '❌'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Usuario:</strong>{' '}
        {user
          ? `${user.profile?.name} ${user.profile?.lastName} (${user.role?.name})`
          : '❌'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>localStorage auth:</strong>
        <pre
          style={{
            fontSize: '10px',
            background: '#333',
            padding: '5px',
            borderRadius: '3px',
          }}
        >
          {JSON.stringify(localStorageData.auth, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button
          onClick={forceLogout}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          🚪 Force Logout
        </button>
        <button
          onClick={goToLogin}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          🔑 Go to Login
        </button>
        <button
          onClick={goToDashboard}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          📊 Go to Dashboard
        </button>
      </div>
    </div>
  );
}
