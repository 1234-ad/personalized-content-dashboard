'use client'

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/lib/store'
import { setDarkMode } from '@/lib/features/uiSlice'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useSelector((state: RootState) => state.ui.darkMode)
  const dispatch = useDispatch()

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme) {
      dispatch(setDarkMode(savedTheme === 'dark'))
    } else {
      dispatch(setDarkMode(prefersDark))
    }
  }, [dispatch])

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  return <>{children}</>
}