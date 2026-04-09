import { describe, expect, it } from 'vitest'
import {
  formatNumber,
  formatProgrammerValue,
  parseDisplayNumber,
} from '../format/numberFormatter'

describe('numberFormatter', () => {
  it('formats numbers with grouping', () => {
    expect(formatNumber(12345.6789)).toBe('12,345.6789')
  })

  it('formats very small values in exponential form', () => {
    expect(formatNumber(0.000000000031)).toContain('e-')
  })

  it('formats programmer output by selected base', () => {
    expect(formatProgrammerValue(31, 'hex')).toBe('0x1F')
    expect(formatProgrammerValue(31, 'bin')).toBe('0b11111')
  })

  it('parses formatted display values', () => {
    expect(parseDisplayNumber('1,024.5')).toBe(1024.5)
  })

  it('parses programmer-prefixed values', () => {
    expect(parseDisplayNumber('0x1F')).toBe(31)
    expect(parseDisplayNumber('-0b1010')).toBe(-10)
  })
})
