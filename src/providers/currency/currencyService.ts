import { CalculationError } from '../../engine/errors'
import { STORAGE_KEYS } from '../../persistence/keys'
import { CurrencyRates } from '../../types/calculator'
import { OpenExchangeProvider } from './openExchangeProvider'
import { StaticFallbackCurrencyProvider } from './staticFallbackProvider'
import { CurrencyCacheEntry, CurrencyProvider } from './types'

const CACHE_TTL_MS = 60 * 60 * 1000

export const supportedCurrencies = [
  'USD',
  'EUR',
  'GBP',
  'RUB',
  'JPY',
  'CNY',
  'CAD',
  'AUD',
  'CHF',
  'INR',
  'BRL',
  'AED',
]

function readCache(): Record<string, CurrencyCacheEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.currencyRates)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as Record<string, CurrencyCacheEntry>
    return parsed ?? {}
  } catch {
    return {}
  }
}

function writeCache(data: Record<string, CurrencyCacheEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.currencyRates, JSON.stringify(data))
  } catch {
    // Intentionally ignore write errors to avoid blocking calculator features.
  }
}

export class CurrencyService {
  constructor(private readonly providers: CurrencyProvider[]) {}

  async getRates(base: string): Promise<CurrencyRates> {
    const normalized = base.toUpperCase()
    const cache = readCache()
    const cached = cache[normalized]

    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return cached.rates
    }

    let lastError: unknown = null
    for (const provider of this.providers) {
      try {
        const rates = await provider.fetchRates(normalized)
        cache[normalized] = { rates, savedAt: Date.now() }
        writeCache(cache)
        return rates
      } catch (error) {
        lastError = error
      }
    }

    if (cached) {
      return cached.rates
    }

    throw new CalculationError(
      lastError instanceof Error
        ? lastError.message
        : 'No currency provider available',
    )
  }
}

export const currencyService = new CurrencyService([
  new OpenExchangeProvider(),
  new StaticFallbackCurrencyProvider(),
])
