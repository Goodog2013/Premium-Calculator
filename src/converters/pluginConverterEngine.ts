import { all, create } from 'mathjs'
import { CalculationError, ValidationError } from '../engine/errors'
import {
  ConverterPluginDefinition,
  ConverterPluginUnitDefinition,
} from '../types/calculator'

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

const PLUGIN_ID_PATTERN = /^[a-z0-9-]{3,64}$/
const UNIT_KEY_PATTERN = /^[a-z0-9_]{2,64}$/
const FORMULA_PATTERN =
  /^[0-9A-Za-z_.,()+\-*/%^\s\u00D7\u00F7\u03C0\u221A]+$/

const ALLOWED_IDENTIFIERS = new Set([
  'value',
  'pi',
  'e',
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
])

function normalizeFormula(formula: string): string {
  return formula
    .replace(/\u00D7/g, '*')
    .replace(/\u00F7/g, '/')
    .replace(/\u03C0/g, 'pi')
    .replace(/\u221A/g, 'sqrt')
    .trim()
}

function validateFormula(formula: string, context: string): string {
  const normalized = normalizeFormula(formula)

  if (!normalized) {
    throw new ValidationError(`${context} formula is empty`)
  }

  if (!FORMULA_PATTERN.test(normalized)) {
    throw new ValidationError(`${context} formula contains unsupported symbols`)
  }

  const identifiers = normalized.match(/[A-Za-z_]+/g)
  if (identifiers) {
    const unsupported = identifiers.find(
      (token) => !ALLOWED_IDENTIFIERS.has(token.toLowerCase()),
    )

    if (unsupported) {
      throw new ValidationError(
        `${context} formula uses unsupported identifier "${unsupported}"`,
      )
    }
  }

  try {
    math.parse(normalized)
  } catch {
    throw new ValidationError(`${context} formula is not a valid expression`)
  }

  return normalized
}

function ensureUniqueUnitKeys(units: ConverterPluginUnitDefinition[]): void {
  const unique = new Set<string>()

  for (const unit of units) {
    if (unique.has(unit.key)) {
      throw new ValidationError(`Duplicate unit key "${unit.key}" in plugin`)
    }

    unique.add(unit.key)
  }
}

function sanitizeUnitDefinition(
  pluginId: string,
  unit: ConverterPluginUnitDefinition,
): ConverterPluginUnitDefinition {
  const key = unit.key.trim().toLowerCase()
  if (!UNIT_KEY_PATTERN.test(key)) {
    throw new ValidationError(
      `Plugin "${pluginId}" has invalid unit key "${unit.key}"`,
    )
  }

  const label = unit.label.trim()
  if (!label) {
    throw new ValidationError(`Unit "${key}" in plugin "${pluginId}" has empty label`)
  }

  const symbol = unit.symbol.trim()
  if (!symbol) {
    throw new ValidationError(
      `Unit "${key}" in plugin "${pluginId}" has empty symbol`,
    )
  }

  return {
    key,
    label,
    symbol,
    toBaseFormula: validateFormula(unit.toBaseFormula, `${pluginId}.${key}.toBase`),
    fromBaseFormula: validateFormula(
      unit.fromBaseFormula,
      `${pluginId}.${key}.fromBase`,
    ),
  }
}

export function sanitizeConverterPluginDefinition(
  plugin: ConverterPluginDefinition,
): ConverterPluginDefinition {
  const id = plugin.id.trim().toLowerCase()
  if (!PLUGIN_ID_PATTERN.test(id)) {
    throw new ValidationError(
      'Plugin id must match [a-z0-9-] and be 3..64 characters long',
    )
  }

  const name = plugin.name.trim()
  if (!name) {
    throw new ValidationError(`Plugin "${id}" must have a name`)
  }

  const description = plugin.description.trim()
  const category = plugin.category.trim()

  if (!category) {
    throw new ValidationError(`Plugin "${id}" must have a category`)
  }

  if (!Array.isArray(plugin.units) || plugin.units.length < 2) {
    throw new ValidationError(`Plugin "${id}" must define at least two units`)
  }

  const units = plugin.units.map((unit) => sanitizeUnitDefinition(id, unit))
  ensureUniqueUnitKeys(units)

  const baseUnitKey = plugin.baseUnitKey.trim().toLowerCase()
  if (!units.some((unit) => unit.key === baseUnitKey)) {
    throw new ValidationError(
      `Plugin "${id}" base unit "${plugin.baseUnitKey}" is not in units list`,
    )
  }

  return {
    id,
    name,
    description,
    category,
    baseUnitKey,
    units,
  }
}

function evaluateFormula(formula: string, value: number): number {
  try {
    const parsed = math.parse(formula)
    const compiled = parsed.compile()
    const output = compiled.evaluate({
      value,
      pi: Math.PI,
      e: Math.E,
      ln: (x: number) => Math.log(x),
      log: (x: number) => Math.log10(x),
      sqrt: (x: number) => Math.sqrt(x),
      sin: (x: number) => Math.sin(x),
      cos: (x: number) => Math.cos(x),
      tan: (x: number) => Math.tan(x),
      asin: (x: number) => Math.asin(x),
      acos: (x: number) => Math.acos(x),
      atan: (x: number) => Math.atan(x),
      abs: (x: number) => Math.abs(x),
      floor: (x: number) => Math.floor(x),
      ceil: (x: number) => Math.ceil(x),
      round: (x: number) => Math.round(x),
      exp: (x: number) => Math.exp(x),
      pow: (x: number, y: number) => Math.pow(x, y),
    })

    const numeric = Number(output)

    if (!Number.isFinite(numeric)) {
      throw new CalculationError('Formula produced non-finite value')
    }

    return numeric
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CalculationError) {
      throw error
    }

    if (error instanceof Error) {
      throw new CalculationError(error.message)
    }

    throw new CalculationError('Failed to evaluate converter formula')
  }
}

function findUnit(
  plugin: ConverterPluginDefinition,
  unitKey: string,
): ConverterPluginUnitDefinition {
  const normalized = unitKey.trim().toLowerCase()
  const unit = plugin.units.find((entry) => entry.key === normalized)

  if (!unit) {
    throw new ValidationError(
      `Unit "${unitKey}" is not available in plugin "${plugin.name}"`,
    )
  }

  return unit
}

export function convertWithPlugin(
  value: number,
  plugin: ConverterPluginDefinition,
  fromUnitKey: string,
  toUnitKey: string,
): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError('Invalid input value')
  }

  const sanitized = sanitizeConverterPluginDefinition(plugin)
  const fromUnit = findUnit(sanitized, fromUnitKey)
  const toUnit = findUnit(sanitized, toUnitKey)

  const baseValue = evaluateFormula(fromUnit.toBaseFormula, value)
  return evaluateFormula(toUnit.fromBaseFormula, baseValue)
}

export function parseConverterPluginJson(
  rawJson: string,
): ConverterPluginDefinition {
  const payload = rawJson.trim()

  if (!payload) {
    throw new ValidationError('Plugin JSON is empty')
  }

  try {
    const parsed = JSON.parse(payload) as ConverterPluginDefinition
    return sanitizeConverterPluginDefinition(parsed)
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error
    }

    throw new ValidationError('Plugin JSON is invalid')
  }
}

