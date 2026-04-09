import { useEffect } from 'react'
import { useCalculatorStore } from '../state/calculatorStore'

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000

export function useCurrencyAutoRefresh(): void {
  const refreshCurrencyRates = useCalculatorStore(
    (state) => state.refreshCurrencyRates,
  )

  useEffect(() => {
    const refreshInBackground = () => {
      void refreshCurrencyRates({ force: true, background: true })
    }

    const intervalId = window.setInterval(
      refreshInBackground,
      AUTO_REFRESH_INTERVAL_MS,
    )

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshInBackground()
      }
    }

    const handleOnline = () => {
      refreshInBackground()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [refreshCurrencyRates])
}
