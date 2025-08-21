'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Ejemplo de componente de login que usa localStorage automáticamente
export const LoginExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated, restoreSession } = useAuth();

  // ✅ Restaurar sesión al cargar el componente
  useEffect(() => {
    restoreSession();
  }, []);

  // ✅ Login con guardado automático en localStorage
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // ✅ El hook maneja automáticamente:
      // - Llamada al API
      // - Guardado en localStorage
      // - Guardado en Redux
      // - Redirección al dashboard
      await login(email, password);
      
      console.log('✅ Login completado desde componente');
    } catch (error) {
      console.error('❌ Error en login:', error);
    }
  };

  // Si ya está autenticado, no mostrar el formulario
  if (isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-green-600">¡Ya estás logueado!</h2>
        <p>Redirigiendo al dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="tu-email@ejemplo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">✅ Funcionalidades automáticas:</h3>
        <ul className="space-y-1 text-xs">
          <li>• Token se guarda automáticamente en localStorage</li>
          <li>• Sesión se restaura al recargar la página</li>
          <li>• Logout automático si el token expira</li>
          <li>• Redirección automática al dashboard</li>
          <li>• Manejo de errores centralizado</li>
        </ul>
      </div>
    </div>
  );
};

// Ejemplo de uso en cualquier parte de la app
export const LogoutButton = () => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    // ✅ Limpia automáticamente localStorage + Redux + redirige
    logout();
  };

  if (!user) return null;

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Cerrar Sesión ({user.name})
    </button>
  );
};
