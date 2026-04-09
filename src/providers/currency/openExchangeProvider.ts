import { CurrencyRates } from '../../types/calculator'
import { CalculationError } from '../../engine/errors'
import { CurrencyProvider } from './types'

interface ExchangeApiResponse {
  result: string
  base_code: string
  rates: Record<string, number>
  time_last_update_unix: number
}

export class OpenExchangeProvider implements CurrencyProvider {
  readonly id = 'open-er-api'
  readonly displayName = 'Open ER API'

  async fetchRates(base: string): Promise<CurrencyRates> {
    const upper = base.toUpperCase()
    const url = `https://open.er-api.com/v6/latest/${upper}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new CalculationError('Currency provider is unavailable')
    }

    const data = (await response.json()) as ExchangeApiResponse

    if (!data.rates || data.result !== 'success') {
      throw new CalculationError('Currency provider returned invalid data')
    }

    return {
      base: data.base_code,
      rates: data.rates,
      timestamp: data.time_last_update_unix * 1000,
      provider: this.displayName,
    }
  }
}
