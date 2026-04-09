import { CurrencyRates } from '../../types/calculator'

export interface CurrencyProvider {
  readonly id: string
  readonly displayName: string
  fetchRates(base: string): Promise<CurrencyRates>
}

export interface CurrencyCacheEntry {
  rates: CurrencyRates
  savedAt: number
}

export interface CurrencyGetRatesOptions {
  forceRefresh?: boolean
}
