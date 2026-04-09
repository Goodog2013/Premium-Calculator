import type { ProgrammerBase } from '../types/calculator'

interface FormatNumberOptions {
  maxFractionDigits?: number
  useGrouping?: boolean
  locale?: string
}

const DEFAULT_MAX_FRACTIONS = 12
const UNICODE_MINUS = /[−﹣－]/g
const INVISIBLE_SPACES = /[\u00A0\u202F\s]/g

function normalizeLocaleNumber(text: string, locale: string): string {
  const parts = new Intl.NumberFormat(locale, {
    useGrouping: true,
    numberingSystem: 'latn',
  }).formatToParts(12345.6)

  const group = parts.find((part) => part.type === 'group')?.value ?? ','
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.'

  let normalized = text.replace(UNICODE_MINUS, '-').replace(INVISIBLE_SPACES, '')

  if (group) {
    normalized = normalized.split(group).join('')
  }

  if (decimal !== '.') {
    normalized = normalized.split(decimal).join('.')
  }

  return normalized
}

export function formatNumber(
  input: number,
  options: FormatNumberOptions = {},
): string {
  if (!Number.isFinite(input)) {
    if (Number.isNaN(input)) return 'NaN'
    return input > 0 ? 'Infinity' : '-Infinity'
  }

  const {
    maxFractionDigits = DEFAULT_MAX_FRACTIONS,
    useGrouping = true,
    locale = 'en-US',
  } = options

  const abs = Math.abs(input)
  if ((abs !== 0 && abs < 1e-8) || abs >= 1e12) {
    return input.toExponential(8).replace(/\.?0+e/, 'e')
  }

  const formatter = new Intl.NumberFormat(locale, {
    useGrouping,
    maximumFractionDigits: maxFractionDigits,
    numberingSystem: 'latn',
  })

  return formatter.format(input)
}

export function formatProgrammerValue(value: number, base: ProgrammerBase): string {
  if (!Number.isFinite(value)) return 'Error'

  const normalized = Math.trunc(value)
  if (base === 'dec') return normalized.toString(10)

  const isNegative = normalized < 0
  const absolute = Math.abs(normalized)

  let raw = ''
  if (base === 'bin') raw = absolute.toString(2)
  if (base === 'oct') raw = absolute.toString(8)
  if (base === 'hex') raw = absolute.toString(16).toUpperCase()

  const prefix = base === 'bin' ? '0b' : base === 'oct' ? '0o' : '0x'
  return `${isNegative ? '-' : ''}${prefix}${raw}`
}

export function parseDisplayNumber(text: string, locale = 'en-US'): number {
  const trimmed = text.trim()
  if (!trimmed) return 0

  const compact = trimmed.replace(UNICODE_MINUS, '-').replace(INVISIBLE_SPACES, '')

  if (/^[-+]?0x[0-9a-f]+$/i.test(compact)) {
    const sign = compact.startsWith('-') ? -1 : 1
    const body = compact.replace(/^[-+]?0x/i, '')
    return sign * parseInt(body, 16)
  }

  if (/^[-+]?0b[01]+$/i.test(compact)) {
    const sign = compact.startsWith('-') ? -1 : 1
    const body = compact.replace(/^[-+]?0b/i, '')
    return sign * parseInt(body, 2)
  }

  if (/^[-+]?0o[0-7]+$/i.test(compact)) {
    const sign = compact.startsWith('-') ? -1 : 1
    const body = compact.replace(/^[-+]?0o/i, '')
    return sign * parseInt(body, 8)
  }

  const normalized = normalizeLocaleNumber(compact, locale)
  const parsed = Number(normalized)
  if (Number.isFinite(parsed)) {
    return parsed
  }

  const fallback = Number(normalizeLocaleNumber(compact, 'en-US'))
  if (!Number.isFinite(fallback)) {
    throw new Error('Invalid number')
  }

  return fallback
}
