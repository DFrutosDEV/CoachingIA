'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuthService } from '@/lib/services/auth-service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getStoredToken, getTokenData } from '@/lib/token-utils';
import { useTranslations } from 'next-intl';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const router = useRouter();
  const { login, logout } = useAuthService();
  const { isAuthenticated, user } = useAuth();
  const t = useTranslations('text.login');

  // Estados para manejar el formulario y "Recuérdame"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [locale, setLocale] = useState('es');

  // Obtener locale de params
  useEffect(() => {
    params.then(({ locale }) => setLocale(locale));
  }, [params]);

  // Cargar email guardado al montar el componente
  useEffect(() => {
    const checkTokenAndAuth = async () => {
      // Solo acceder a localStorage en el cliente
      if (typeof window !== 'undefined') {
        // 1. Primero verificar si hay un token almacenado
        const storedToken = getStoredToken();

        if (storedToken) {
          // 2. Verificar si el token es válido y no ha expirado
          const tokenData = getTokenData(storedToken);

          if (!tokenData) {
            // Token inválido o expirado - desloguear al usuario
            console.log('❌ Token inválido o expirado, deslogueando usuario');
            await logout();
            toast.error(
              t('sessionExpired')
            );
            return;
          }
        }

        // 3. Solo después de verificar el token, verificar si está autenticado
        if (isAuthenticated && user) {
          router.push(`/${locale}/dashboard/${user.role.name.toLowerCase()}`);
          return;
        }

        // 4. Cargar email guardado si no está autenticado
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      }
    };

    checkTokenAndAuth();
  }, [isAuthenticated, user, router, logout, locale]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await login(email, password);

    if (result.success) {
      toast.success(t('loading'));

      // Manejar localStorage según el estado de "Recuérdame"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      if (result.success && 'user' in result && result.user) {
        const user = result.user;
        setTimeout(() => {
          // Determinar la ruta basada en el primer rol o el rol principal
          const primaryRole = user.role?.name?.toLowerCase() || 'client';
          router.push(`/${locale}/dashboard/${primaryRole}`);
        }, 1000);
      }
    } else {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.error(t('error'));
      }
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center mx-auto">
      <Link href={`/${locale}`} className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="outlined">← {t('backToHome')}</Button>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>
                  {t('subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder={t('email')}
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('password')}</Label>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t('rememberMe')}
                    </Label>
                  </div>
                  <Button variant="outlined" type="submit" className="w-full">
                    {t('loginButton')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
