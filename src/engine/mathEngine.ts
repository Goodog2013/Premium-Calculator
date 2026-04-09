import { all, create } from 'mathjs'
import {
  AngleMode,
  EvaluationOptions,
  GraphPoint,
  ProgrammerBase,
} from '../types/calculator'
import { CalculationError, ValidationError } from './errors'

const math = create(all, {
  number: 'number',
  precision: 64,
})

math.import(
  {
    import: () => {
      throw new Error('Function import is disabled')
    },
    createUnit: () => {
      throw new Error('Function createUnit is disabled')
    },
  },
  {
    override: true,
  },
)

const STANDARD_ALLOWED_PATTERN =
  /^[0-9A-Za-z_.,()+\-*/%^\sπ√]+$/

const PROGRAMMER_ALLOWED_PATTERN =
  /^[0-9A-Za-z_()+\-*/%&|~<>\s]+$/

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
])

function toRadians(value: number, mode: AngleMode): number {
  return mode === 'deg' ? (value * Math.PI) / 180 : value
}

function fromRadians(value: number, mode: AngleMode): number {
  return mode === 'deg' ? (value * 180) / Math.PI : value
}

function createAngleAwareScope(angleMode: AngleMode): Record<string, unknown> {
  return {
    pi: Math.PI,
    e: Math.E,
    sin: (x: number) => Math.sin(toRadians(x, angleMode)),
    cos: (x: number) => Math.cos(toRadians(x, angleMode)),
    tan: (x: number) => Math.tan(toRadians(x, angleMode)),
    asin: (x: number) => fromRadians(Math.asin(x), angleMode),
    acos: (x: number) => fromRadians(Math.acos(x), angleMode),
    atan: (x: number) => fromRadians(Math.atan(x), angleMode),
    ln: (x: number) => Math.log(x),
    log: (x: number) => Math.log10(x),
    sqrt: (x: number) => Math.sqrt(x),
  }
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

function ensureValidCharacters(expression: string, programmerMode: boolean): void {
  const pattern = programmerMode
    ? PROGRAMMER_ALLOWED_PATTERN
    : STANDARD_ALLOWED_PATTERN

  if (!pattern.test(expression)) {
    throw new ValidationError('Expression contains unsupported symbols')
  }
}

function replacePercentWithDivision(expression: string): string {
  let current = expression

  for (let index = 0; index < 12; index += 1) {
    const next = current.replace(
      /(\d+(?:\.\d+)?|\([^()]*\))%/g,
      '($1/100)',
    )

    if (next === current) break
    current = next
  }

  return current
}

function normalizeCommon(expression: string): string {
  return expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/\blog10\b/g, 'log')
}

function normalizeStandardExpression(expression: string): string {
  const normalized = normalizeCommon(expression.trim())
  return replacePercentWithDivision(normalized)
}

function tokenToDecimal(token: string, programmerBase: ProgrammerBase): string {
  if (/^0x[0-9a-f]+$/i.test(token)) {
    return parseInt(token.slice(2), 16).toString(10)
  }

  if (/^0b[01]+$/i.test(token)) {
    return parseInt(token.slice(2), 2).toString(10)
  }

  if (/^0o[0-7]+$/i.test(token)) {
    return parseInt(token.slice(2), 8).toString(10)
  }

  if (/^\d+$/.test(token) && programmerBase === 'dec') {
    return token
  }

  if (/^[A-Fa-f0-9]+$/.test(token)) {
    const radix =
      programmerBase === 'bin'
        ? 2
        : programmerBase === 'oct'
          ? 8
          : programmerBase === 'hex'
            ? 16
            : 10

    const converted = parseInt(token, radix)
    if (Number.isNaN(converted)) {
      throw new ValidationError(`Invalid value "${token}" for base ${programmerBase}`)
    }

    return converted.toString(10)
  }

  throw new ValidationError(`Unsupported token "${token}"`)
}

function normalizeProgrammerExpression(
  expression: string,
  programmerBase: ProgrammerBase,
): string {
  const normalized = normalizeCommon(expression.trim())

  const tokens = normalized.match(
    /0x[0-9a-f]+|0b[01]+|0o[0-7]+|<<|>>|>>>|\b(?:and|or|xor|not)\b|[A-Fa-f0-9]+|[()+\-*/%&|~^]/gi,
  )

  if (!tokens || tokens.length === 0) {
    throw new ValidationError('Expression is empty')
  }

  return tokens
    .map((token) => {
      const lower = token.toLowerCase()

      if (lower === 'and') return '&'
      if (lower === 'or') return '|'
      if (lower === 'xor') return ' xor '
      if (lower === 'not') return '~'

      if (
        token === '(' ||
        token === ')' ||
        token === '+' ||
        token === '-' ||
        token === '*' ||
        token === '/' ||
        token === '%' ||
        token === '&' ||
        token === '|' ||
        token === '~' ||
        token === '<<' ||
        token === '>>' ||
        token === '>>>'
      ) {
        return token
      }

      if (token === '^') {
        return ' xor '
      }

      return tokenToDecimal(token, programmerBase)
    })
    .join(' ')
}

function validateIdentifiers(expression: string): void {
  const matches = expression.match(/[A-Za-z_]+/g)
  if (!matches) return

  const unsupported = matches.find(
    (token) => !IDENTIFIER_TOKENS.has(token.toLowerCase()),
  )

  if (unsupported) {
    throw new ValidationError(`Unsupported function: ${unsupported}`)
  }
}

function ensureFiniteNumber(value: unknown): number {
  const asNumber =
    typeof value === 'number'
      ? value
      : typeof value === 'bigint'
        ? Number(value)
        : Number(value)

  if (!Number.isFinite(asNumber)) {
    throw new CalculationError('Computation produced non-finite value')
  }

  return asNumber
}

export function evaluateExpression(
  expression: string,
  options: EvaluationOptions,
): number {
  const raw = expression.trim()
  if (!raw) {
    throw new ValidationError('Expression is empty')
  }

  const programmerMode = options.mode === 'programmer'
  ensureValidCharacters(raw, programmerMode)
  ensureBalancedParentheses(raw)

  try {
    if (programmerMode) {
      const normalized = normalizeProgrammerExpression(raw, options.programmerBase)
      const value = math.evaluate(normalized)
      return Math.trunc(ensureFiniteNumber(value))
    }

    const normalized = normalizeStandardExpression(raw)
    validateIdentifiers(normalized)

    const node = math.parse(normalized)
    const compiled = node.compile()
    const scope = createAngleAwareScope(options.angleMode)

    const value = compiled.evaluate(scope)
    return ensureFiniteNumber(value)
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CalculationError) {
      throw error
    }

    if (error instanceof Error) {
      throw new CalculationError(error.message)
    }

    throw new CalculationError('Unable to evaluate expression')
  }
}

export function evaluateGraphPoints(
  expression: string,
  angleMode: AngleMode,
  xMin: number,
  xMax: number,
  sampleCount = 180,
): GraphPoint[] {
  const trimmed = expression.trim()
  if (!trimmed) return []

  ensureValidCharacters(trimmed, false)
  ensureBalancedParentheses(trimmed)

  const normalized = normalizeStandardExpression(trimmed)
  validateIdentifiers(normalized)

  const node = math.parse(normalized)
  const compiled = node.compile()
  const scope = createAngleAwareScope(angleMode)

  const points: GraphPoint[] = []
  const span = xMax - xMin
  const safeSpan = span === 0 ? 1 : span

  for (let i = 0; i <= sampleCount; i += 1) {
    const x = xMin + (safeSpan * i) / sampleCount

    try {
      const yValue = compiled.evaluate({ ...scope, x })
      const y = ensureFiniteNumber(yValue)

      if (!Number.isFinite(y) || Math.abs(y) > 1_000_000) {
        continue
      }

      points.push({ x, y })
    } catch {
      // Skip singularity points; chart keeps remaining continuous segments.
    }
  }

  return points
}
