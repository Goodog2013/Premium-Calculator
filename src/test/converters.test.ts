import { describe, expect, it } from 'vitest'
import { convertUnits } from '../converters/unitConverter'
import { CurrencyService } from '../providers/currency/currencyService'
import { CurrencyProvider } from '../providers/currency/types'

describe('unitConverter', () => {
  it('converts kilometers to miles', () => {
    const result = convertUnits(10, 'length', 'kilometer', 'mile')
    expect(result).toBeCloseTo(6.2137, 3)
  })

  it('converts celsius to fahrenheit', () => {
    const result = convertUnits(25, 'temperature', 'celsius', 'fahrenheit')
    expect(result).toBeCloseTo(77)
  })
})

describe('currency service abstraction', () => {
  it('falls back to next provider when first fails', async () => {
    const failingProvider: CurrencyProvider = {
      id: 'broken',
      displayName: 'Broken provider',
      fetchRates: async () => {
        throw new Error('provider down')
      },
    }

    const workingProvider: CurrencyProvider = {
      id: 'ok',
      displayName: 'Working provider',
      fetchRates: async (base: string) => ({
        base,
        rates: { USD: 1, EUR: 0.9 },
        timestamp: Date.now(),
        provider: 'Working provider',
      }),
    }

    const service = new CurrencyService([failingProvider, workingProvider])

    const rates = await service.getRates('USD')
    expect(rates.provider).toBe('Working provider')
    expect(rates.rates.EUR).toBe(0.9)
  })
})
