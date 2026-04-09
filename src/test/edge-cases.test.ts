import { describe, expect, it } from 'vitest'
import { evaluateExpression, evaluateGraphPoints } from '../engine/mathEngine'

describe('engine edge cases', () => {
  it('rejects division by zero non-finite result', () => {
    expect(() =>
      evaluateExpression('1/0', {
        mode: 'standard',
        angleMode: 'deg',
        programmerBase: 'dec',
      }),
    ).toThrow()
  })

  it('rejects unsupported identifiers', () => {
    expect(() =>
      evaluateExpression('import(1)', {
        mode: 'scientific',
        angleMode: 'deg',
        programmerBase: 'dec',
      }),
    ).toThrow()
  })

  it('builds graph points despite singularities', () => {
    const points = evaluateGraphPoints('1/x', 'rad', -10, 10, 120)
    expect(points.length).toBeGreaterThan(50)
  })
})
