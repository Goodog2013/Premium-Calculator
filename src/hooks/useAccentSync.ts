import { useEffect } from 'react'
import { useCalculatorStore } from '../state/calculatorStore'
import { getAccentOption } from '../theme/accentPalette'

export function useAccentSync(): void {
  const accentColor = useCalculatorStore((state) => state.accentColor)

  useEffect(() => {
    const root = document.documentElement
    const accent = getAccentOption(accentColor)

    root.style.setProperty('--accent-rgb', accent.rgb.join(' '))
    root.style.setProperty('--accent-soft-rgb', accent.softRgb.join(' '))
    root.style.setProperty('--accent-deep-rgb', accent.deepRgb.join(' '))
  }, [accentColor])
}
