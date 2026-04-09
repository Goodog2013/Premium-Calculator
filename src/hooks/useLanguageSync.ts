import { useEffect } from 'react'
import { isRtlLanguage } from '../i18n/languages'
import { useCalculatorStore } from '../state/calculatorStore'

export function useLanguageSync(): void {
  const language = useCalculatorStore((state) => state.language)

  useEffect(() => {
    const root = document.documentElement
    root.lang = language
    root.dir = isRtlLanguage(language) ? 'rtl' : 'ltr'
  }, [language])
}
