import React from 'react'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../components/theme-provider'
import { MUIProvider } from '../components/mui-provider'
import { ClientLayout } from '../components/ClientLayout'
import { ReduxProvider } from '../components/redux-provider'
import { ThemeSync } from '../components/theme-sync'
import { DebugRedux } from '../components/debug-redux'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'Coaching IA',
  description: 'Coaching IA',
  generator: 'coaching-ia',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Coaching IA',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        {/*MODIFICAR ICONO DE APLICACION*/}
        <link rel="apple-touch-icon" href="/next.svg" />
      </head>
      <body>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <MUIProvider>
              <ThemeSync />
                <ClientLayout>
                  {children}
                  <Toaster position="bottom-right" richColors />
                  {process.env.NODE_ENV === 'development' && <DebugRedux />}  
                </ClientLayout>
            </MUIProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
