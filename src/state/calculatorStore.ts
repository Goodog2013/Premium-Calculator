import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { convertUnits } from '../converters/unitConverter'
import { evaluateExpression, evaluateGraphPoints } from '../engine/mathEngine'
import { parseDisplayNumber, formatNumber, formatProgrammerValue } from '../format/numberFormatter'
import {
  defaultLanguage,
  isSupportedLanguage,
} from '../i18n/languages'
import type { AppLanguageCode } from '../i18n/languages'
import { STORAGE_KEYS } from '../persistence/keys'
import {
  currencyService,
  supportedCurrencies,
} from '../providers/currency/currencyService'
import {
  AngleMode,
  CalculatorMode,
  CurrencyConverterState,
  FavoriteEntry,
  GraphState,
  HistoryEntry,
  ProgrammerBase,
  SidePanelTab,
  ThemeMode,
  UnitCategory,
  UnitConverterState,
} from '../types/calculator'

interface CurrencyRefreshOptions {
  force?: boolean
  background?: boolean
}

interface CalculatorStore {
  mode: CalculatorMode
  sidePanelTab: SidePanelTab
  theme: ThemeMode
  language: AppLanguageCode
  angleMode: AngleMode
  programmerBase: ProgrammerBase
  isAdvancedCollapsed: boolean

  expression: string
  result: string
  preview: string
  error: string | null

  history: HistoryEntry[]
  favorites: FavoriteEntry[]
  memoryValue: number | null

  unitConverter: UnitConverterState
  currencyConverter: CurrencyConverterState
  graph: GraphState

  setMode: (mode: CalculatorMode) => void
  setSidePanelTab: (tab: SidePanelTab) => void
  setTheme: (theme: ThemeMode) => void
  setLanguage: (language: AppLanguageCode) => void
  toggleAdvancedCollapsed: () => void

  setAngleMode: (mode: AngleMode) => void
  setProgrammerBase: (base: ProgrammerBase) => void

  setExpression: (expression: string) => void
  appendToken: (token: string) => void
  backspace: () => void
  clearExpression: () => void
  clearError: () => void
  evaluate: () => void

  addFavorite: (label?: string) => void
  removeFavorite: (id: string) => void
  applyFavorite: (id: string) => void
  clearHistory: () => void
  applyHistory: (id: string) => void

  memoryClear: () => void
  memoryStore: () => void
  memoryAdd: () => void
  memorySubtract: () => void
  memoryRecall: () => void

  setUnitCategory: (category: UnitCategory) => void
  setUnitFrom: (fromUnit: string) => void
  setUnitTo: (toUnit: string) => void
  setUnitInput: (value: string) => void

  setCurrencyBase: (base: string) => Promise<void>
  setCurrencyQuote: (quote: string) => void
  setCurrencyAmount: (amount: string) => void
  refreshCurrencyRates: (options?: CurrencyRefreshOptions) => Promise<void>

  setGraphExpression: (expression: string) => void
  setGraphWindow: (xMin: number, xMax: number) => void
  rebuildGraph: () => void
}

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const initialUnitConverter: UnitConverterState = {
  category: 'length',
  fromUnit: 'meter',
  toUnit: 'kilometer',
  inputValue: '1',
  outputValue: '0.001',
  error: null,
}

const initialCurrencyConverter: CurrencyConverterState = {
  base: 'USD',
  quote: 'EUR',
  amount: '100',
  outputValue: '91',
  isLoading: false,
  providerName: 'Open ER API',
  lastUpdatedAt: null,
  error: null,
}

const initialGraph: GraphState = {
  expression: 'sin(x)',
  xMin: -10,
  xMax: 10,
  points: [],
  error: null,
}

function evaluatePreview(state: {
  expression: string
  mode: CalculatorMode
  angleMode: AngleMode
  programmerBase: ProgrammerBase
  language: AppLanguageCode
}): string {
  const expression = state.expression.trim()
  if (!expression) return ''

  try {
    const value = evaluateExpression(expression, {
      mode: state.mode,
      angleMode: state.angleMode,
      programmerBase: state.programmerBase,
    })

    return state.mode === 'programmer'
      ? formatProgrammerValue(value, state.programmerBase)
      : formatNumber(value, { locale: state.language })
  } catch {
    return ''
  }
}

function calculateUnitOutput(
  state: UnitConverterState,
  language: AppLanguageCode,
): UnitConverterState {
  const numeric = Number(state.inputValue)
  if (!Number.isFinite(numeric)) {
    return { ...state, outputValue: '', error: 'Enter a valid number' }
  }

  try {
    const converted = convertUnits(
      numeric,
      state.category,
      state.fromUnit,
      state.toUnit,
    )

    return {
      ...state,
      outputValue: formatNumber(converted, {
        maxFractionDigits: 10,
        locale: language,
      }),
      error: null,
    }
  } catch (error) {
    return {
      ...state,
      outputValue: '',
      error: error instanceof Error ? error.message : 'Cannot convert units',
    }
  }
}

function computeCurrencyOutput(
  state: CurrencyConverterState,
  rates: Record<string, number> | null,
  language: AppLanguageCode,
): CurrencyConverterState {
  const amount = Number(state.amount)
  if (!Number.isFinite(amount)) {
    return { ...state, outputValue: '', error: 'Enter a valid amount' }
  }

  if (!rates) {
    return { ...state, outputValue: '', error: 'No currency rates loaded yet' }
  }

  const quoteRate = rates[state.quote]
  if (!quoteRate) {
    return { ...state, outputValue: '', error: 'Quote currency unavailable' }
  }

  return {
    ...state,
    outputValue: formatNumber(amount * quoteRate, {
      maxFractionDigits: 6,
      locale: language,
    }),
    error: null,
  }
}

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set, get) => {
      let lastRates: Record<string, number> | null = null

      const recalcGraph = (): GraphState => {
        const { graph, angleMode } = get()

        try {
          const points = evaluateGraphPoints(
            graph.expression,
            angleMode,
            graph.xMin,
            graph.xMax,
          )

          return { ...graph, points, error: null }
        } catch (error) {
          return {
            ...graph,
            points: [],
            error: error instanceof Error ? error.message : 'Failed to build graph',
          }
        }
      }

      return {
        mode: 'standard',
        sidePanelTab: 'history',
        theme: 'system',
        language: defaultLanguage,
        angleMode: 'deg',
        programmerBase: 'dec',
        isAdvancedCollapsed: false,

        expression: '',
        result: '0',
        preview: '',
        error: null,

        history: [],
        favorites: [],
        memoryValue: null,

        unitConverter: initialUnitConverter,
        currencyConverter: initialCurrencyConverter,
        graph: initialGraph,

        setMode: (mode) => {
          set((state) => ({
            mode,
            error: null,
            preview: evaluatePreview({
              expression: state.expression,
              mode,
              angleMode: state.angleMode,
              programmerBase: state.programmerBase,
              language: state.language,
            }),
          }))

          if (mode === 'graph') {
            set({ graph: recalcGraph() })
          }
        },

        setSidePanelTab: (sidePanelTab) => set({ sidePanelTab }),
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) =>
          set((state) => ({
            language,
            preview: evaluatePreview({
              expression: state.expression,
              mode: state.mode,
              angleMode: state.angleMode,
              programmerBase: state.programmerBase,
              language,
            }),
            unitConverter: calculateUnitOutput(state.unitConverter, language),
            currencyConverter: lastRates
              ? computeCurrencyOutput(state.currencyConverter, lastRates, language)
              : state.currencyConverter,
          })),
        toggleAdvancedCollapsed: () =>
          set((state) => ({ isAdvancedCollapsed: !state.isAdvancedCollapsed })),

        setAngleMode: (angleMode) => {
          set((state) => ({
            angleMode,
            preview: evaluatePreview({
              expression: state.expression,
              mode: state.mode,
              angleMode,
              programmerBase: state.programmerBase,
              language: state.language,
            }),
          }))
          set({ graph: recalcGraph() })
        },

        setProgrammerBase: (programmerBase) => {
          set((state) => ({
            programmerBase,
            preview: evaluatePreview({
              expression: state.expression,
              mode: state.mode,
              angleMode: state.angleMode,
              programmerBase,
              language: state.language,
            }),
          }))
        },

        setExpression: (expression) => {
          set((state) => ({
            expression,
            preview: evaluatePreview({
              expression,
              mode: state.mode,
              angleMode: state.angleMode,
              programmerBase: state.programmerBase,
              language: state.language,
            }),
            error: null,
          }))
        },

        appendToken: (token) => {
          set((state) => {
            const expression = `${state.expression}${token}`
            return {
              expression,
              preview: evaluatePreview({
                expression,
                mode: state.mode,
                angleMode: state.angleMode,
                programmerBase: state.programmerBase,
                language: state.language,
              }),
              error: null,
            }
          })
        },

        backspace: () => {
          set((state) => {
            const expression = state.expression.slice(0, -1)
            return {
              expression,
              preview: evaluatePreview({
                expression,
                mode: state.mode,
                angleMode: state.angleMode,
                programmerBase: state.programmerBase,
                language: state.language,
              }),
              error: null,
            }
          })
        },

        clearExpression: () =>
          set({
            expression: '',
            preview: '',
            error: null,
            result: '0',
          }),

        clearError: () => set({ error: null }),

        evaluate: () => {
          const state = get()

          const mode = state.mode === 'graph' ? 'scientific' : state.mode

          if (mode === 'unit' || mode === 'currency') {
            return
          }

          try {
            const value = evaluateExpression(state.expression, {
              mode,
              angleMode: state.angleMode,
              programmerBase: state.programmerBase,
            })

            const formattedResult =
              mode === 'programmer'
                ? formatProgrammerValue(value, state.programmerBase)
                : formatNumber(value, { locale: state.language })

            const nextHistory: HistoryEntry[] = [
              {
                id: createId(),
                expression: state.expression,
                result: formattedResult,
                mode: state.mode,
                createdAt: Date.now(),
              },
              ...state.history,
            ].slice(0, 160)

            set({
              result: formattedResult,
              expression: mode === 'programmer' ? formattedResult : `${value}`,
              preview: '',
              error: null,
              history: nextHistory,
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to evaluate',
              preview: '',
            })
          }
        },

        addFavorite: (label) => {
          const { expression, mode } = get()
          if (!expression.trim()) return

          set((state) => ({
            favorites: [
              {
                id: createId(),
                label: label?.trim() || expression,
                expression,
                mode,
                createdAt: Date.now(),
              },
              ...state.favorites,
            ].slice(0, 80),
          }))
        },

        removeFavorite: (id) =>
          set((state) => ({
            favorites: state.favorites.filter((item) => item.id !== id),
          })),

        applyFavorite: (id) => {
          const favorite = get().favorites.find((entry) => entry.id === id)
          if (!favorite) return

          set((state) => ({
            expression: favorite.expression,
            mode:
              favorite.mode === 'currency' || favorite.mode === 'unit'
                ? state.mode
                : favorite.mode,
            preview: evaluatePreview({
              expression: favorite.expression,
              mode: favorite.mode,
              angleMode: state.angleMode,
              programmerBase: state.programmerBase,
              language: state.language,
            }),
            error: null,
          }))
        },

        clearHistory: () => set({ history: [] }),

        applyHistory: (id) => {
          const entry = get().history.find((item) => item.id === id)
          if (!entry) return

          set((state) => ({
            expression: entry.expression,
            result: entry.result,
            mode:
              entry.mode === 'currency' || entry.mode === 'unit'
                ? state.mode
                : entry.mode,
            preview: evaluatePreview({
              expression: entry.expression,
              mode: entry.mode,
              angleMode: state.angleMode,
              programmerBase: state.programmerBase,
              language: state.language,
            }),
            error: null,
          }))
        },

        memoryClear: () => set({ memoryValue: null }),

        memoryStore: () => {
          const { result, language } = get()
          try {
            set({ memoryValue: parseDisplayNumber(result, language) })
          } catch {
            // Ignore invalid numbers from display.
          }
        },

        memoryAdd: () => {
          const { memoryValue, result, language } = get()
          try {
            const next = (memoryValue ?? 0) + parseDisplayNumber(result, language)
            set({ memoryValue: next })
          } catch {
            // Ignore invalid numbers from display.
          }
        },

        memorySubtract: () => {
          const { memoryValue, result, language } = get()
          try {
            const next = (memoryValue ?? 0) - parseDisplayNumber(result, language)
            set({ memoryValue: next })
          } catch {
            // Ignore invalid numbers from display.
          }
        },

        memoryRecall: () => {
          const { memoryValue, mode, programmerBase } = get()
          if (memoryValue === null) return

          const token =
            mode === 'programmer'
              ? formatProgrammerValue(memoryValue, programmerBase)
              : formatNumber(memoryValue, {
                  maxFractionDigits: 12,
                  useGrouping: false,
                  locale: 'en-US',
                })

          set((state) => {
            const expression = `${state.expression}${token}`
            return {
              expression,
              preview: evaluatePreview({
                expression,
                mode: state.mode,
                angleMode: state.angleMode,
                programmerBase: state.programmerBase,
                language: state.language,
              }),
            }
          })
        },

        setUnitCategory: (category) => {
          const defaults: Record<UnitCategory, { from: string; to: string }> = {
            length: { from: 'meter', to: 'kilometer' },
            mass: { from: 'kilogram', to: 'pound' },
            temperature: { from: 'celsius', to: 'fahrenheit' },
            area: { from: 'square_meter', to: 'square_foot' },
            volume: { from: 'liter', to: 'gallon_us' },
            speed: { from: 'meter_per_second', to: 'kilometer_per_hour' },
            time: { from: 'second', to: 'hour' },
            data: { from: 'byte', to: 'megabyte' },
          }

          set((state) => {
            const next = calculateUnitOutput({
              ...state.unitConverter,
              category,
              fromUnit: defaults[category].from,
              toUnit: defaults[category].to,
            }, state.language)

            return { unitConverter: next }
          })
        },

        setUnitFrom: (fromUnit) =>
          set((state) => ({
            unitConverter: calculateUnitOutput({
              ...state.unitConverter,
              fromUnit,
            }, state.language),
          })),

        setUnitTo: (toUnit) =>
          set((state) => ({
            unitConverter: calculateUnitOutput({
              ...state.unitConverter,
              toUnit,
            }, state.language),
          })),

        setUnitInput: (inputValue) =>
          set((state) => ({
            unitConverter: calculateUnitOutput({
              ...state.unitConverter,
              inputValue,
            }, state.language),
          })),

        setCurrencyBase: async (base) => {
          set((state) => ({
            currencyConverter: {
              ...state.currencyConverter,
              base,
            },
          }))
          await get().refreshCurrencyRates({ force: true })
        },

        setCurrencyQuote: (quote) =>
          set((state) => ({
            currencyConverter: computeCurrencyOutput(
              {
                ...state.currencyConverter,
                quote,
              },
              lastRates,
              state.language,
            ),
          })),

        setCurrencyAmount: (amount) =>
          set((state) => ({
            currencyConverter: computeCurrencyOutput(
              {
                ...state.currencyConverter,
                amount,
              },
              lastRates,
              state.language,
            ),
          })),

        refreshCurrencyRates: async (options) => {
          const { base } = get().currencyConverter
          const force = options?.force === true
          const background = options?.background === true

          if (!background) {
            set((state) => ({
              currencyConverter: {
                ...state.currencyConverter,
                isLoading: true,
                error: null,
              },
            }))
          }

          try {
            const rates = await currencyService.getRates(base, {
              forceRefresh: force,
            })
            lastRates = rates.rates

            set((state) => ({
              currencyConverter: computeCurrencyOutput(
                {
                  ...state.currencyConverter,
                  providerName: rates.provider,
                  lastUpdatedAt: rates.timestamp,
                  isLoading: false,
                },
                rates.rates,
                state.language,
              ),
            }))
          } catch (error) {
            if (background && get().currencyConverter.lastUpdatedAt) {
              set((state) => ({
                currencyConverter: {
                  ...state.currencyConverter,
                  isLoading: false,
                },
              }))
            } else {
              set((state) => ({
                currencyConverter: {
                  ...state.currencyConverter,
                  isLoading: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Unable to refresh currency rates',
                },
              }))
            }
          }
        },

        setGraphExpression: (expression) => {
          set((state) => ({
            graph: {
              ...state.graph,
              expression,
            },
          }))

          set({ graph: recalcGraph() })
        },

        setGraphWindow: (xMin, xMax) => {
          set((state) => ({
            graph: {
              ...state.graph,
              xMin,
              xMax,
            },
          }))

          set({ graph: recalcGraph() })
        },

        rebuildGraph: () => {
          set({ graph: recalcGraph() })
        },
      }
    },
    {
      name: STORAGE_KEYS.calculatorState,
      partialize: (state) => ({
        mode: state.mode,
        sidePanelTab: state.sidePanelTab,
        theme: state.theme,
        language: state.language,
        angleMode: state.angleMode,
        programmerBase: state.programmerBase,
        isAdvancedCollapsed: state.isAdvancedCollapsed,
        expression: state.expression,
        result: state.result,
        history: state.history,
        favorites: state.favorites,
        memoryValue: state.memoryValue,
        unitConverter: state.unitConverter,
        currencyConverter: {
          ...state.currencyConverter,
          isLoading: false,
        },
        graph: state.graph,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return

          state.language = isSupportedLanguage(state.language)
            ? state.language
            : defaultLanguage

          state.unitConverter = calculateUnitOutput(
            state.unitConverter,
            state.language,
          )

          if (!supportedCurrencies.includes(state.currencyConverter.base)) {
            state.currencyConverter.base = 'USD'
          }

          if (!supportedCurrencies.includes(state.currencyConverter.quote)) {
            state.currencyConverter.quote = 'EUR'
          }

          state.graph = {
            ...state.graph,
            points: evaluateGraphPoints(
              state.graph.expression,
              state.angleMode,
              state.graph.xMin,
              state.graph.xMax,
            ),
            error: null,
          }
        }
      },
    },
  ),
)

export { supportedCurrencies }
