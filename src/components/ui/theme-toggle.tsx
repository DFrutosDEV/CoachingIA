'use client'

import { useTheme } from 'next-themes'
import { Button } from '@mui/material'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="contained"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        minWidth: 'auto',
        width: '48px',
        height: '48px',
        padding: '0',
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        borderRadius: '50%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}