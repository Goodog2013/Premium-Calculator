export type CalculatorMode =
  | 'standard'
  | 'scientific'
  | 'programmer'
  | 'unit'
  | 'currency'
  | 'graph'
  | 'symbolic'

export type AngleMode = 'deg' | 'rad'
export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor =
  | 'cyan'
  | 'blue'
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'teal'
  | 'slate'
export type SidePanelTab = 'history' | 'favorites' | 'settings'
export type ProgrammerBase = 'bin' | 'oct' | 'dec' | 'hex'

export interface HistoryEntry {
  id: string
  expression: string
  result: string
  mode: CalculatorMode
  createdAt: number
}

export interface FavoriteEntry {
  id: string
  label: string
  expression: string
  mode: CalculatorMode
  createdAt: number
}

export interface MemoryRegister {
  value: number | null
}

export interface UnitConverterState {
  category: UnitCategory
  fromUnit: string
  toUnit: string
  inputValue: string
  outputValue: string
  error: string | null
}

export interface CurrencyConverterState {
  base: string
  quote: string
  amount: string
  outputValue: string
  isLoading: boolean
  providerName: string
  lastUpdatedAt: number | null
  error: string | null
}

export interface GraphState {
  expression: string
  xMin: number
  xMax: number
  points: GraphPoint[]
  error: string | null
}

export interface SymbolicState {
  solveExpression: string
  solveVariable: string
  solveResult: string
  factorExpression: string
  factorResult: string
  simplifyExpression: string
  simplifyResult: string
  error: string | null
}

export interface ConverterPluginUnitDefinition {
  key: string
  label: string
  symbol: string
  toBaseFormula: string
  fromBaseFormula: string
}

export interface ConverterPluginDefinition {
  id: string
  name: string
  description: string
  category: string
  baseUnitKey: string
  units: ConverterPluginUnitDefinition[]
}

export interface PluginConverterState {
  pluginId: string
  fromUnit: string
  toUnit: string
  inputValue: string
  outputValue: string
  error: string | null
}

export interface GraphPoint {
  x: number
  y: number
}

export interface EvaluationOptions {
  mode: CalculatorMode
  angleMode: AngleMode
  programmerBase: ProgrammerBase
}

export type UnitCategory =
  | 'length'
  | 'mass'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'data'

export interface UnitDefinition {
  key: string
  label: string
  symbol: string
  factor: number
  offset?: number
}

export interface UnitCategoryDefinition {
  key: UnitCategory
  label: string
  units: UnitDefinition[]
}

export interface CurrencyRates {
  base: string
  rates: Record<string, number>
  timestamp: number
  provider: string
}
