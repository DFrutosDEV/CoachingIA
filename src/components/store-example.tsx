'use client'

import React from 'react'
import { useUIStore, useDataStore } from '../lib/stores'
import { useAuthService } from '../lib/services/auth-service'

export const StoreExample: React.FC = () => {
  // Usar el servicio de autenticación
  const { user, isAuthenticated, login, logout, hasRole, getUserRoles } = useAuthService()
  
  // Usar el store de UI
  const { sidebarOpen, toggleSidebar, addNotification } = useUIStore()
  
  // Usar el store de datos
  const { clients, coaches, enterprises, setLoading } = useDataStore()

  const handleLogin = async () => {
    const result = await login('usuario@ejemplo.com', 'password123')
    
    if (result.success) {
      console.log('Login exitoso:', result.user)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleToggleSidebar = () => {
    toggleSidebar()
  }

  const handleLoadData = async () => {
    setLoading(true)
    
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false)
      addNotification({
        type: 'success',
        message: 'Datos cargados correctamente',
        duration: 2000,
      })
    }, 1000)
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Ejemplo de Estados Globales</h2>
      
      {/* Sección de Autenticación */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Estado de Autenticación</h3>
        <div className="space-y-2">
          <p>Autenticado: {isAuthenticated ? 'Sí' : 'No'}</p>
          {user && (
            <div>
              <p>Usuario: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Roles: {getUserRoles().join(', ')}</p>
              <div className="mt-2">
                <p className="text-sm font-medium">Permisos:</p>
                <ul className="text-sm text-gray-600">
                  <li>Admin: {hasRole('admin') ? 'Sí' : 'No'}</li>
                  <li>Coach: {hasRole('coach') ? 'Sí' : 'No'}</li>
                  <li>Client: {hasRole('client') ? 'Sí' : 'No'}</li>
                  <li>Enterprise: {hasRole('enterprise') ? 'Sí' : 'No'}</li>
                </ul>
              </div>
            </div>
          )}
          <div className="space-x-2">
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Iniciar Sesión
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sección de UI */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Estado de UI</h3>
        <div className="space-y-2">
          <p>Sidebar abierto: {sidebarOpen ? 'Sí' : 'No'}</p>
          <button
            onClick={handleToggleSidebar}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Toggle Sidebar
          </button>
          <button
            onClick={() => addNotification({
              type: 'warning',
              message: 'Esta es una notificación de prueba',
              duration: 4000,
            })}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 ml-2"
          >
            Mostrar Notificación
          </button>
        </div>
      </div>

      {/* Sección de Datos */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Estado de Datos</h3>
        <div className="space-y-2">
          <p>Clientes: {clients.length}</p>
          <p>Coaches: {coaches.length}</p>
          <p>Empresas: {enterprises.length}</p>
          <button
            onClick={handleLoadData}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Cargar Datos
          </button>
        </div>
      </div>
    </div>
  )
} 