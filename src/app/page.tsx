import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@mui/material"
import imgHome1 from "../img/imgHome1.png"
import { ArrowRight, CheckCircle, Users, Calendar, BarChart } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div style={{ minWidth: '-webkit-fill-available' }} className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-primary font-bold text-xl">CoachingIA</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Características
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
              Testimonios
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Precios
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
                    Conecta con coaches profesionales que te ayudarán a alcanzar tus metas personales y profesionales.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button variant="contained" size="large" endIcon={<ArrowRight className="h-4 w-4" />}>
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
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Características principales
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nuestra plataforma ofrece todo lo que necesitas para una experiencia de coaching efectiva.
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
                    Conecta con coaches certificados y especializados en diferentes áreas.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Sesiones Flexibles</h3>
                  <p className="text-muted-foreground">Programa sesiones según tu disponibilidad y necesidades.</p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Seguimiento de Progreso</h3>
                  <p className="text-muted-foreground">Visualiza tu avance y mantén un registro de tus logros.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Lo que dicen nuestros usuarios
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Historias de éxito de personas que han transformado sus vidas con nuestra plataforma.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-lg border p-6">
                <div className="flex items-center gap-4">
                  <Image
                    src="https://unavatar.io/github/37t?fallback=https://source.boringavatars.com/marble/120/1337_user?colors=264653r,2a9d8f,e9c46a,f4a261,e76f51"
                    alt="Avatar"
                    className="rounded-full"
                    height={50}
                    width={50}
                  />
                  <div>
                    <h3 className="text-lg font-bold">María García</h3>
                    <p className="text-sm text-muted-foreground">Cliente desde 2022</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Gracias a mi coach he podido superar obstáculos que me impedían avanzar en mi carrera profesional.
                  Ahora tengo más confianza y claridad sobre mis objetivos."
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border p-6">
                <div className="flex items-center gap-4">
                  <Image
                    src="https://unavatar.io/github/37t?fallback=https://avatar.vercel.sh/37t?size=400"
                    alt="Avatar"
                    className="rounded-full"
                    height={50}
                    width={50}
                  />
                  <div>
                    <h3 className="text-lg font-bold">Carlos Rodríguez</h3>
                    <p className="text-sm text-muted-foreground">Cliente desde 2023</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "La plataforma es muy intuitiva y me ha permitido encontrar un coach que realmente entiende mis
                  necesidades. Las sesiones son transformadoras."
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Planes simples y transparentes
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Elige el plan que mejor se adapte a tus necesidades.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Básico</h3>
                  <p className="text-4xl font-bold">
                    €49<span className="text-sm font-normal text-muted-foreground">/mes</span>
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>2 sesiones mensuales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Acceso a recursos básicos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Soporte por email</span>
                    </li>
                  </ul>
                </div>
                <Button variant="contained" className="mt-6">Comenzar</Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                    Popular
                  </div>
                  <h3 className="text-2xl font-bold">Profesional</h3>
                  <p className="text-4xl font-bold">
                    €99<span className="text-sm font-normal text-muted-foreground">/mes</span>
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>4 sesiones mensuales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Acceso a todos los recursos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Soporte prioritario</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Seguimiento personalizado</span>
                    </li>
                  </ul>
                </div>
                <Button variant="contained" className="mt-6">Comenzar</Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Empresas</h3>
                  <p className="text-4xl font-bold">
                    €199<span className="text-sm font-normal text-muted-foreground">/mes</span>
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>8 sesiones mensuales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Acceso a todos los recursos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Soporte 24/7</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Coaching para equipos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Informes detallados</span>
                    </li>
                  </ul>
                </div>
                <Button variant="contained" className="mt-6">Contactar</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12 mx-auto">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-primary font-bold text-xl">CoachingIA</span>
            </div>
            <p className="text-sm text-muted-foreground">Transformando vidas a través del coaching personalizado.</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Plataforma</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Testimonios
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container flex flex-col gap-4 py-10 border-t md:h-16 md:flex-row md:py-4 mx-auto">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CoachingIA. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
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
            <Link href="#" className="text-muted-foreground hover:text-foreground">
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
            <Link href="#" className="text-muted-foreground hover:text-foreground">
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
  )
}
