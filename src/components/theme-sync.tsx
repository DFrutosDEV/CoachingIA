'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { setTheme as setReduxTheme } from '@/lib/redux/slices/sessionSlice'

export function ThemeSync() {
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const reduxTheme = useAppSelector(state => state.session.theme)

  useEffect(() => {
    // Sincronizar Redux con next-themes al inicializar
    if (theme && theme !== reduxTheme) {
      dispatch(setReduxTheme(theme as 'light' | 'dark' | 'system'))
    }
  }, [theme, reduxTheme, dispatch])

  useEffect(() => {
    // Sincronizar next-themes con Redux cuando Redux cambie
    if (reduxTheme && reduxTheme !== theme) {
      setTheme(reduxTheme)
    }
  }, [reduxTheme, theme, setTheme])

  return null
} 