import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@mui/material';
import imgHome1 from '@/img/imgHome1.png';
import {
  ArrowRight,
  Users,
  Calendar,
  BarChart,
  Target,
  Zap,
  Shield,
  Star,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('text.home');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div
          style={{ minWidth: '-webkit-fill-available' }}
          className="container flex h-16 items-center justify-between px-4 md:px-6"
        >
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-primary font-bold text-xl">CoachingIA</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              {t('navigation.features')}
            </Link>
            <Link
              href="#benefits"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              {t('navigation.benefits')}
            </Link>
            <Link
              href="#process"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              {t('navigation.process')}
            </Link>
          </nav>
          <div className="flex gap-4 items-center">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href={`/${locale}/login`}>
              <Button variant="text">{t('navigation.login')}</Button>
            </Link>
            {/* <Link href="/register" className="hidden md:block">
              <Button variant="contained">Registrarse</Button>
            </Link> */}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {t('hero.title')}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t('hero.description')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={`/${locale}/login`}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      {t('hero.startButton')}
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outlined" size="large">
                      {t('hero.learnMoreButton')}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src={imgHome1}
                  alt="Coaching"
                  className="aspect-square rounded-xl object-cover"
                  height={550}
                  width={550}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Estadísticas */}
        {/* <section className="w-full py-12 md:py-24 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">500+</div>
                <p className="text-sm text-muted-foreground">Coaches Certificados</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
                <p className="text-sm text-muted-foreground">Sesiones Completadas</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">95%</div>
                <p className="text-sm text-muted-foreground">Satisfacción</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground">Soporte Disponible</p>
              </div>
            </div>
          </div>
        </section> */}

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('features.title')}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('features.description')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('features.expertCoaches.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('features.expertCoaches.description')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('features.flexibleSessions.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('features.flexibleSessions.description')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('features.progressTracking.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('features.progressTracking.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nueva sección de Beneficios */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('benefits.title')}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('benefits.description')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex items-start space-x-4 p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('benefits.quickResults.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('benefits.quickResults.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('benefits.confidentiality.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('benefits.confidentiality.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                  <Target className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('benefits.personalized.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('benefits.personalized.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                  <Star className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('benefits.quality.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('benefits.quality.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nueva sección de Proceso */}
        <section
          id="process"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('process.title')}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('process.description')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 lg:grid-cols-4 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('process.step1.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('process.step1.description')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('process.step2.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('process.step2.description')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('process.step3.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('process.step3.description')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  4
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('process.step4.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('process.step4.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary to-primary/80">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('cta.title')}
              </h2>
              <p className="max-w-[600px] mx-auto md:text-xl">
                {t('cta.description')}
              </p>
              {/* <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
                <Link href="/register">
                  <Button 
                    variant="" 
                    size="large" 
                    endIcon={<ArrowRight className="h-4 w-4" />}
                    sx={{ 
                      backgroundColor: 'white', 
                      color: 'primary.main',
                      '&:hover': { backgroundColor: 'white' }
                    }}
                  >
                    Comenzar ahora
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="outlined" 
                    size="large"
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white',
                      '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div> */}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:p-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-primary font-bold text-xl">CoachingIA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t('footer.platform')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation.features')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#benefits"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation.benefits')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#process"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation.process')}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium font-bold">{t('footer.company')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('footer.aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('footer.blog')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('footer.contact')}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t('footer.legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('footer.terms')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('footer.cookies')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 py-10 border-t md:h-16 md:flex-row md:py-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} KytCoaching. {t('footer.copyright')}
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="sr-only">Instagram</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </footer>
      <ThemeToggle />
    </div>
  );
}
