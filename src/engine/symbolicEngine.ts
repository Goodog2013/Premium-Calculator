import nerdamer from 'nerdamer'
import 'nerdamer/Algebra'
import 'nerdamer/Solve'
import { CalculationError, ValidationError } from './errors'

const SYMBOLIC_ALLOWED_PATTERN =
  /^[0-9A-Za-z_.,=()+\-*/%^\s\u00D7\u00F7\u03C0\u221A]+$/
const VARIABLE_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

const IDENTIFIER_TOKENS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sqrt',
  'log',
  'ln',
  'abs',
  'floor',
  'ceil',
  'round',
  'exp',
  'pow',
  'pi',
  'e',
  'x',
  'y',
  'z',
])

function normalizeExpression(expression: string): string {
  return expression
    .replace(/\u00D7/g, '*')
    .replace(/\u00F7/g, '/')
    .replace(/\u03C0/g, 'pi')
    .replace(/\u221A/g, 'sqrt')
    .trim()
}

function ensureBalancedParentheses(expression: string): void {
  let depth = 0

  for (const char of expression) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1

    if (depth < 0) {
      throw new ValidationError('Closing parenthesis without opening parenthesis')
    }
  }

  if (depth !== 0) {
    throw new ValidationError('Mismatched parentheses')
  }
}

function ensureSafeExpression(expression: string): void {
  if (!expression) {
    throw new ValidationError('Expression is empty')
  }

  if (!SYMBOLIC_ALLOWED_PATTERN.test(expression)) {
    throw new ValidationError('Expression contains unsupported symbols')
  }

  ensureBalancedParentheses(expression)

  const identifiers = expression.match(/[A-Za-z_]+/g)
  if (!identifiers) return

  const unsupported = identifiers.find(
    (token) =>
      !IDENTIFIER_TOKENS.has(token.toLowerCase()) &&
      !VARIABLE_PATTERN.test(token),
  )

  if (unsupported) {
    throw new ValidationError(`Unsupported identifier: ${unsupported}`)
  }
}

function ensureValidVariable(variable: string): string {
  const trimmed = variable.trim() || 'x'

  if (!VARIABLE_PATTERN.test(trimmed)) {
    throw new ValidationError('Variable name must be alphanumeric and start with a letter')
  }

  return trimmed
}

function normalizeEquationParts(expression: string): {
  equation: string
  left: string
  right: string
} {
  const parts = expression.split('=')

  if (parts.length !== 2) {
    throw new ValidationError('Equation must contain exactly one "=" symbol')
  }

  const left = parts[0].trim()
  const right = parts[1].trim()

  if (!left || !right) {
    throw new ValidationError('Both sides of equation are required')
  }

  return {
    equation: `${left}=${right}`,
    left,
    right,
  }
}

function normalizeSolutionValue(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}` : 'NaN'
  }

  if (typeof value === 'bigint') {
    return value.toString(10)
  }

  if (Array.isArray(value) && value.length > 0) {
    return normalizeSolutionValue(value[value.length - 1])
  }

  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value)
  }

  return 'Unknown'
}

export interface SymbolicSolveResult {
  variable: string
  normalizedEquation: string
  solutions: string[]
}

export function solveEquation(
  expression: string,
  variable: string,
): SymbolicSolveResult {
  const normalized = normalizeExpression(expression)
  ensureSafeExpression(normalized)

  const targetVariable = ensureValidVariable(variable)
  const equationParts = normalizeEquationParts(normalized)

  try {
    const rawSolutions = nerdamer.solveEquations(
      equationParts.equation,
      targetVariable,
    )

    const normalizedSolutions = Array.isArray(rawSolutions)
      ? rawSolutions
          .map((entry) => {
            if (Array.isArray(entry) && entry.length > 1) {
              return normalizeSolutionValue(entry[1])
            }

            return normalizeSolutionValue(entry)
          })
          .filter((entry) => entry !== 'Unknown')
      : []

    const deduped = Array.from(new Set(normalizedSolutions))

    return {
      variable: targetVariable,
      normalizedEquation: equationParts.equation,
      solutions: deduped,
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error
    }

    if (error instanceof Error) {
      throw new CalculationError(error.message)
    }

    throw new CalculationError('Unable to solve equation')
  }
}

export function factorizeExpression(expression: string): string {
  const normalized = normalizeExpression(expression)
  ensureSafeExpression(normalized)

  if (normalized.includes('=')) {
    throw new ValidationError('Factorization expects an expression without "="')
  }

  try {
    return nerdamer(`factor(${normalized})`).toString()
  } catch (error) {
    if (error instanceof Error) {
      throw new CalculationError(error.message)
    }

    throw new CalculationError('Unable to factorize expression')
  }
}

export function simplifySymbolicExpression(expression: string): string {
  const normalized = normalizeExpression(expression)
  ensureSafeExpression(normalized)

  if (normalized.includes('=')) {
    throw new ValidationError('Simplification expects an expression without "="')
  }

  try {
    return nerdamer.simplify(normalized).toString()
  } catch (error) {
    if (error instanceof Error) {
      throw new CalculationError(error.message)
    }

    throw new CalculationError('Unable to simplify expression')
  }
}

