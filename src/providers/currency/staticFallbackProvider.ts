import { CurrencyRates } from '../../types/calculator'
import { CurrencyProvider } from './types'

const staticRatesUsd: Record<string, number> = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.77,
  RUB: 92,
  JPY: 151,
  CNY: 7.2,
  CAD: 1.34,
  AUD: 1.5,
  CHF: 0.88,
  INR: 83.1,
  BRL: 5.04,
  AED: 3.67,
}

export class StaticFallbackCurrencyProvider implements CurrencyProvider {
  readonly id = 'static-fallback'
  readonly displayName = 'Offline fallback rates'

  async fetchRates(base: string): Promise<CurrencyRates> {
    const upper = base.toUpperCase()
    const usdToBase = staticRatesUsd[upper] || 1

    const rates: Record<string, number> = {}
    for (const [currency, usdRate] of Object.entries(staticRatesUsd)) {
      rates[currency] = usdRate / usdToBase
    }

    return {
      base: upper,
      rates,
      timestamp: Date.now(),
      provider: this.displayName,
    }
  }
}
