import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@mui/material';
import imgHome1 from '../img/imgHome1.png';
import {
  ArrowRight,
  Users,
  Calendar,
  BarChart,
  Target,
  Zap,
  Shield,
  Star,
  TrendingUp,
  Clock,
  Award,
  Heart,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home() {
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
              Características
            </Link>
            <Link
              href="#benefits"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Beneficios
            </Link>
            <Link
              href="#process"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Proceso
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="text">Iniciar Sesión</Button>
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
                    Transforma tu vida con coaching personalizado
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Conecta con coaches profesionales que te ayudarán a alcanzar
                    tus metas personales y profesionales.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Comenzar ahora
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outlined" size="large">
                      Conoce más
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
                  Características principales
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nuestra plataforma ofrece todo lo que necesitas para una
                  experiencia de coaching efectiva.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Coaches Expertos</h3>
                  <p className="text-muted-foreground">
                    Conecta con coaches certificados y especializados en
                    diferentes áreas.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Sesiones Flexibles</h3>
                  <p className="text-muted-foreground">
                    Programa sesiones según tu disponibilidad y necesidades.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Seguimiento de Progreso</h3>
                  <p className="text-muted-foreground">
                    Visualiza tu avance y mantén un registro de tus logros.
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
                  ¿Por qué elegir CoachingIA?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Descubre las ventajas únicas que hacen de nuestra plataforma
                  la elección perfecta para tu desarrollo personal.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex items-start space-x-4 p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Resultados Rápidos</h3>
                  <p className="text-muted-foreground">
                    Nuestro método probado te ayuda a ver cambios significativos
                    en las primeras semanas de coaching.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Confidencialidad Total</h3>
                  <p className="text-muted-foreground">
                    Tus sesiones y datos personales están protegidos con los más
                    altos estándares de seguridad.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                  <Target className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Enfoque Personalizado</h3>
                  <p className="text-muted-foreground">
                    Cada sesión se adapta a tus objetivos específicos y tu
                    estilo de aprendizaje único.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                  <Star className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Calidad Garantizada</h3>
                  <p className="text-muted-foreground">
                    Todos nuestros coaches pasan por un riguroso proceso de
                    selección y certificación.
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
                  Tu camino hacia el éxito
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Un proceso simple y efectivo para alcanzar tus metas
                  personales y profesionales.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 lg:grid-cols-4 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Personaliza tu perfil</h3>
                  <p className="text-muted-foreground">
                    Ingresa tus datos de sesión y completa tu perfil personal.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Encuentra tu Coach</h3>
                  <p className="text-muted-foreground">
                    Mantente conectado con tu coach y recibe asesoría
                    personalizada.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Agenda tu sesión</h3>
                  <p className="text-muted-foreground">
                    Agenda tu primera sesión en el horario que mejor te
                    convenga.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  4
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Transforma tu vida</h3>
                  <p className="text-muted-foreground">
                    Comienza tu viaje de transformación personal y alcanza tus
                    metas.
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
                ¿Listo para transformar tu vida?
              </h2>
              <p className="max-w-[600px] mx-auto md:text-xl">
                Únete a miles de personas que ya han cambiado sus vidas con
                CoachingIA.
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
              Transformando vidas a través del coaching personalizado.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Plataforma</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Características
                  </Link>
                </li>
                <li>
                  <Link
                    href="#benefits"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Beneficios
                  </Link>
                </li>
                <li>
                  <Link
                    href="#process"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Proceso
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium font-bold">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Términos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 py-10 border-t md:h-16 md:flex-row md:py-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CoachingIA. Todos los derechos
            reservados.
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
