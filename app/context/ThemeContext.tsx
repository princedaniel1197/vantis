'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'pitch' | 'work'

interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'pitch', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('pitch')

  useEffect(() => {
    const el = document.documentElement
    if (theme === 'work') {
      el.classList.add('work')
    } else {
      el.classList.remove('work')
    }
  }, [theme])

  function toggle() {
    setTheme(t => (t === 'pitch' ? 'work' : 'pitch'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
