import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectLanguageByIp } from '../providers/language/ipLanguageService'

describe('ip language detection', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps country code from IP provider to supported language', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country_code: 'RU' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const detected = await detectLanguageByIp()
    expect(detected).toBe('ru-RU')
  })

  it('falls back to browser language when country is unknown', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ country_code: 'ZZ' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'de-DE',
    })

    const detected = await detectLanguageByIp()
    expect(detected).toBe('de-DE')
  })
})
