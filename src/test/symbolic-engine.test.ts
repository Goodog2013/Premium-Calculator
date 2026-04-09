import { describe, expect, it } from 'vitest'
import {
  factorizeExpression,
  simplifySymbolicExpression,
  solveEquation,
} from '../engine/symbolicEngine'

describe('symbolicEngine', () => {
  it('solves polynomial equations', () => {
    const result = solveEquation('x^2 - 5*x + 6 = 0', 'x')
    expect(result.solutions).toEqual(expect.arrayContaining(['2', '3']))
  })

  it('factorizes expressions', () => {
    const factored = factorizeExpression('x^3-1').replace(/\s+/g, '')
    expect(factored).toMatch(/\(-?1\+x\)|\(x-1\)/)
    expect(factored).toContain('x^2')
  })

  it('simplifies symbolic expressions', () => {
    const simplified = simplifySymbolicExpression('(x^2-1)/(x-1)').replace(
      /\s+/g,
      '',
    )
    expect(['x+1', '1+x']).toContain(simplified)
  })

  it('requires equation format for solver', () => {
    expect(() => solveEquation('x^2 - 5*x + 6', 'x')).toThrow()
  })
})

