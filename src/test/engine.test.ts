import { describe, expect, it } from 'vitest'
import { evaluateExpression, evaluateGraphPoints } from '../engine/mathEngine'

describe('mathEngine.evaluateExpression', () => {
  it('evaluates standard arithmetic with parentheses', () => {
    const result = evaluateExpression('(2+3)*4', {
      mode: 'standard',
      angleMode: 'deg',
      programmerBase: 'dec',
    })

    expect(result).toBe(20)
  })

  it('supports percent syntax', () => {
    const result = evaluateExpression('250*10%', {
      mode: 'standard',
      angleMode: 'deg',
      programmerBase: 'dec',
    })

    expect(result).toBeCloseTo(25)
  })

  it('uses degree mode for trig', () => {
    const result = evaluateExpression('sin(30)', {
      mode: 'scientific',
      angleMode: 'deg',
      programmerBase: 'dec',
    })

    expect(result).toBeCloseTo(0.5)
  })

  it('supports programmer mode with hexadecimal input', () => {
    const result = evaluateExpression('A + 5', {
      mode: 'programmer',
      angleMode: 'deg',
      programmerBase: 'hex',
    })

    expect(result).toBe(15)
  })

  it('throws for invalid parentheses', () => {
    expect(() =>
      evaluateExpression('(2+3', {
        mode: 'standard',
        angleMode: 'deg',
        programmerBase: 'dec',
      }),
    ).toThrow()
  })
})

describe('mathEngine.evaluateGraphPoints', () => {
  it('samples points for graph expression', () => {
    const points = evaluateGraphPoints('sin(x)', 'rad', -3, 3, 60)
    expect(points.length).toBeGreaterThan(20)
  })
})
