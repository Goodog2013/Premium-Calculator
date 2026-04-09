import { CalculationError } from '../../engine/errors'
import { CurrencyRates } from '../../types/calculator'
import { CurrencyProvider } from './types'

interface FrankfurterResponse {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

export class FrankfurterProvider implements CurrencyProvider {
  readonly id = 'frankfurter-api'
  readonly displayName = 'Frankfurter API'

  async fetchRates(base: string): Promise<CurrencyRates> {
    const upper = base.toUpperCase()
    const url = `https://api.frankfurter.app/latest?from=${upper}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new CalculationError('Currency provider is unavailable')
    }

    const data = (await response.json()) as FrankfurterResponse
    if (!data.rates || !data.base) {
      throw new CalculationError('Currency provider returned invalid data')
    }

    const withBase: Record<string, number> = {
      ...data.rates,
      [upper]: 1,
    }

    const parsedDate = Number.isFinite(Date.parse(data.date))
      ? Date.parse(`${data.date}T00:00:00Z`)
      : Date.now()

    return {
      base: data.base,
      rates: withBase,
      timestamp: parsedDate,
      provider: this.displayName,
    }
  }
}
