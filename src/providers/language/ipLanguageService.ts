import {
  AppLanguageCode,
  defaultLanguage,
  resolveLanguage,
} from '../../i18n/languages'

const REQUEST_TIMEOUT_MS = 3500

const COUNTRY_LANGUAGE_MAP: Partial<Record<string, AppLanguageCode>> = {
  US: 'en-US',
  GB: 'en-US',
  CA: 'en-US',
  AU: 'en-US',
  NZ: 'en-US',
  IE: 'en-US',
  IN: 'hi-IN',
  PK: 'ur-PK',
  BD: 'bn-BD',
  CN: 'zh-CN',
  HK: 'zh-CN',
  TW: 'zh-CN',
  SG: 'zh-CN',
  JP: 'ja-JP',
  KR: 'ko-KR',
  VN: 'vi-VN',
  TH: 'th-TH',
  ID: 'id-ID',
  MY: 'ms-MY',
  PH: 'fil-PH',
  TR: 'tr-TR',
  SA: 'ar-SA',
  AE: 'ar-SA',
  EG: 'ar-SA',
  MA: 'ar-SA',
  DZ: 'ar-SA',
  IR: 'fa-IR',
  RU: 'ru-RU',
  UA: 'uk-UA',
  DE: 'de-DE',
  AT: 'de-DE',
  CH: 'de-DE',
  FR: 'fr-FR',
  BE: 'fr-FR',
  ES: 'es-ES',
  MX: 'es-ES',
  AR: 'es-ES',
  CO: 'es-ES',
  CL: 'es-ES',
  PE: 'es-ES',
  BR: 'pt-BR',
  PT: 'pt-BR',
  IT: 'it-IT',
  NL: 'nl-NL',
  PL: 'pl-PL',
  CZ: 'cs-CZ',
  SK: 'sk-SK',
  SE: 'sv-SE',
  DK: 'da-DK',
  NO: 'nb-NO',
  FI: 'fi-FI',
  GR: 'el-GR',
  RO: 'ro-RO',
  BG: 'bg-BG',
  RS: 'sr-RS',
  HR: 'hr-HR',
  ET: 'am-ET',
  KE: 'sw-KE',
  NG: 'ha-NG',
}

interface IpGeoResponse {
  country_code?: string
  countryCode?: string
}

function getBrowserLanguageFallback(): AppLanguageCode {
  if (typeof navigator === 'undefined') {
    return defaultLanguage
  }

  return resolveLanguage(navigator.language)
}

async function fetchJsonWithTimeout(url: string): Promise<IpGeoResponse | null> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      return null
    }
    return (await response.json()) as IpGeoResponse
  } catch {
    return null
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function fetchCountryCodeByIp(): Promise<string | null> {
  const sources = [
    'https://ipapi.co/json/',
    'https://ipwho.is/',
  ]

  for (const url of sources) {
    const payload = await fetchJsonWithTimeout(url)
    const candidate = payload?.country_code ?? payload?.countryCode
    if (candidate && candidate.length === 2) {
      return candidate.toUpperCase()
    }
  }

  return null
}

export async function detectLanguageByIp(): Promise<AppLanguageCode> {
  const countryCode = await fetchCountryCodeByIp()
  if (!countryCode) {
    return getBrowserLanguageFallback()
  }

  return COUNTRY_LANGUAGE_MAP[countryCode] ?? getBrowserLanguageFallback()
}
