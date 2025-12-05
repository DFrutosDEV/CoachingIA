import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/theme-provider';
import { MUIProvider } from '@/components/mui-provider';
import { ClientLayout } from '@/components/ClientLayout';
import { ReduxProvider } from '@/components/redux-provider';
import { ThemeSync } from '@/components/theme-sync';
import { DebugRedux } from '@/components/debug-redux';
import { Toaster } from 'sonner';
import { RouteGuard } from '@/components/auth/RouteGuard';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'KytCoaching',
  description: 'KytCoaching',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = {
    common: (await import(`../../locales/${locale}/common.json`)).default,
    text: (await import(`../../locales/${locale}/text.json`)).default
  };

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        {/*MODIFICAR ICONO DE APLICACION*/}
        <link rel="apple-touch-icon" href="/next.svg" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ReduxProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <MUIProvider>
                <ThemeSync />
                <RouteGuard>
                  <ClientLayout>
                    {children}
                    <Toaster position="bottom-right" richColors />
                    {/* {process.env.NODE_ENV === 'development' && <DebugRedux />} */}
                  </ClientLayout>
                </RouteGuard>
              </MUIProvider>
            </ThemeProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
