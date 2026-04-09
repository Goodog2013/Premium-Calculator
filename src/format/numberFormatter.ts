import { ProgrammerBase } from '../types/calculator'

interface FormatNumberOptions {
  maxFractionDigits?: number
  useGrouping?: boolean
}

const DEFAULT_MAX_FRACTIONS = 12

export function formatNumber(
  input: number,
  options: FormatNumberOptions = {},
): string {
  if (!Number.isFinite(input)) {
    if (Number.isNaN(input)) return 'NaN'
    return input > 0 ? 'Infinity' : '-Infinity'
  }

  const { maxFractionDigits = DEFAULT_MAX_FRACTIONS, useGrouping = true } =
    options

  const abs = Math.abs(input)
  if ((abs !== 0 && abs < 1e-8) || abs >= 1e12) {
    return input.toExponential(8).replace(/\.?0+e/, 'e')
  }

  const formatter = new Intl.NumberFormat('en-US', {
    useGrouping,
    maximumFractionDigits: maxFractionDigits,
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

export function parseDisplayNumber(text: string): number {
  const normalized = text.replace(/,/g, '').trim()
  if (!normalized) return 0

  if (/^[-+]?0x[0-9a-f]+$/i.test(normalized)) {
    const sign = normalized.startsWith('-') ? -1 : 1
    const body = normalized.replace(/^[-+]?0x/i, '')
    return sign * parseInt(body, 16)
  }

  if (/^[-+]?0b[01]+$/i.test(normalized)) {
    const sign = normalized.startsWith('-') ? -1 : 1
    const body = normalized.replace(/^[-+]?0b/i, '')
    return sign * parseInt(body, 2)
  }

  if (/^[-+]?0o[0-7]+$/i.test(normalized)) {
    const sign = normalized.startsWith('-') ? -1 : 1
    const body = normalized.replace(/^[-+]?0o/i, '')
    return sign * parseInt(body, 8)
  }

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) {
    throw new Error('Invalid number')
  }

  return parsed
}
