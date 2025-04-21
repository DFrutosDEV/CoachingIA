'use client'

import * as React from 'react'
import { createTheme } from '@mui/material/styles'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(222.2 47.4% 11.2%)', // --primary del modo claro
    },
    background: {
      default: 'hsl(0 0% 100%)', // --background del modo claro
      paper: 'hsl(0 0% 100%)', // --background del modo claro
    },
    text: {
      primary: 'hsl(222.2 84% 4.9%)', // --foreground del modo claro
      secondary: 'hsl(215.4 16.3% 46.9%)', // --muted-foreground del modo claro
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    allVariants: {
      fontFamily: inter.style.fontFamily,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
        },
        contained: {
          color: '#ffffff', // Color blanco para el texto de los botones contenidos
          '&:hover': {
            backgroundColor: 'hsl(222.2 47.4% 20%)', // Un tono más claro del color primario para el hover
            color: '#ffffff', // Mantener el texto blanco en el hover
          },
        },
      },
    },
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff', // Blanco para el modo oscuro
    },
    background: {
      default: 'hsl(222.2 84% 4.9%)', // --background del modo oscuro
      paper: 'hsl(222.2 84% 4.9%)', // --background del modo oscuro
    },
    text: {
      primary: 'hsl(210 40% 98%)', // --foreground del modo oscuro
      secondary: 'hsl(215 20.2% 65.1%)', // --muted-foreground del modo oscuro
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    allVariants: {
      fontFamily: inter.style.fontFamily,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
        },
      },
    },
  },
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <NextThemesProvider {...props}>
      <div className={inter.className}>
        {children}
      </div>
    </NextThemesProvider>
  )
}

export { useTheme } from 'next-themes'
