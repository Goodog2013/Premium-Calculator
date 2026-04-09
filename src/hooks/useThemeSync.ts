import { useEffect } from 'react'
import { useCalculatorStore } from '../state/calculatorStore'

export function useThemeSync(): void {
  const theme = useCalculatorStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const resolved =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme

      root.dataset.theme = resolved
      root.classList.toggle('theme-dark', resolved === 'dark')
      root.classList.toggle('theme-light', resolved === 'light')
    }

    apply()
    media.addEventListener('change', apply)

    return () => media.removeEventListener('change', apply)
  }, [theme])
}
