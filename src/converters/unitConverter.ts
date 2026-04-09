import { unitCatalog } from './unitCatalog'
import { UnitCategory, UnitDefinition } from '../types/calculator'
import { ValidationError } from '../engine/errors'

function getUnit(category: UnitCategory, key: string): UnitDefinition {
  const categoryDef = unitCatalog.find((entry) => entry.key === category)
  if (!categoryDef) {
    throw new ValidationError('Unknown unit category')
  }

  const unit = categoryDef.units.find((item) => item.key === key)
  if (!unit) {
    throw new ValidationError('Unknown unit')
  }

  return unit
}

function toBase(value: number, unit: UnitDefinition): number {
  const offset = unit.offset ?? 0
  return (value + offset) * unit.factor
}

function fromBase(baseValue: number, unit: UnitDefinition): number {
  const offset = unit.offset ?? 0
  return baseValue / unit.factor - offset
}

export function convertUnits(
  value: number,
  category: UnitCategory,
  fromUnitKey: string,
  toUnitKey: string,
): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError('Invalid input value')
  }

  const fromUnit = getUnit(category, fromUnitKey)
  const toUnit = getUnit(category, toUnitKey)

  const base = toBase(value, fromUnit)
  return fromBase(base, toUnit)
}

export function getUnitsByCategory(category: UnitCategory): UnitDefinition[] {
  return unitCatalog.find((entry) => entry.key === category)?.units ?? []
}
