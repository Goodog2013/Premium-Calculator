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

  it('solves rational equations with symbolic parameters', () => {
    const result = solveEquation('(2a-7b+5)/(7a+2b+5)=9', 'a')
    expect(result.solutions).toHaveLength(1)
    expect(result.solutions[0].replace(/\s+/g, '')).toContain('(-25*b-40)')
    expect(result.solutions[0].replace(/\s+/g, '')).toContain('1/61')
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

  it('simplifies equations by reducing to zero form', () => {
    const simplified = simplifySymbolicExpression('(2a-7b+5)/(7a+2b+5)=9').replace(
      /\s+/g,
      '',
    )
    expect(simplified).toMatch(
      /((25\*b\+40\+61\*a|61\*a\+25\*b\+40|-25\*b-40-61\*a)|-\(25\*b\+40\+61\*a\))=0/,
    )
  })

  it('requires equation format for solver', () => {
    expect(() => solveEquation('x^2 - 5*x + 6', 'x')).toThrow()
  })
})

