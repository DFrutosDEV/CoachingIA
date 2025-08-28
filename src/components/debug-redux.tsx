'use client'

import React, { useEffect } from 'react'
import { useAppSelector } from '@/lib/redux/hooks'

export const DebugRedux: React.FC = () => {
  const authState = useAppSelector(state => state.auth)
  const sessionState = useAppSelector(state => state.session)

  useEffect(() => {
    console.log('🔍 Debug Redux State:')
    console.log('Auth State:', authState)
    console.log('Session State:', sessionState)
    console.log('LocalStorage auth:', localStorage.getItem('persist:auth'))
    console.log('LocalStorage session:', localStorage.getItem('persist:session'))
  }, [authState, sessionState])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#000',
      color: '#fff',
      padding: '8px',
      fontSize: '12px',
      borderRadius: '4px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Debug Redux:</strong></div>
      <div>User: {authState.user?.profile?.name + ' ' + authState.user?.profile?.lastName || 'No user'}</div>
      <div>Token: {authState.token ? 'Yes' : 'No'}</div>
      <div>Authenticated: {authState.isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Redux Theme: {sessionState.theme}</div>
      <div>Current Theme: {typeof document !== 'undefined' ? document.documentElement.className : 'Loading...'}</div>
    </div>
  )
}