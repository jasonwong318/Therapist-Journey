import { useState, useEffect } from 'react'

export const useDarkMode = () => {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('tt_dark')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('tt_dark', String(dark))
  }, [dark])

  return { dark, toggleDark: () => setDark(d => !d) }
}
