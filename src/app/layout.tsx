import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../components/theme-provider'
import { MUIProvider } from '../components/mui-provider'
import { register } from './register-sw'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Coaching IA',
  description: 'Coaching IA',
  generator: 'coaching-ia',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
  React.useEffect(() => {
    register();
  }, []);

  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        -- MODIFICAR ICONO DE APLICACION
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MUIProvider>
            {children}
          </MUIProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
