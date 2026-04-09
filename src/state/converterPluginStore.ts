import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  convertWithPlugin,
  parseConverterPluginJson,
  sanitizeConverterPluginDefinition,
} from '../converters/pluginConverterEngine'
import { formatNumber } from '../format/numberFormatter'
import { STORAGE_KEYS } from '../persistence/keys'
import { listAllConverterPlugins } from '../providers/converterPlugins/pluginService'
import {
  ConverterPluginDefinition,
  PluginConverterState,
} from '../types/calculator'

interface ConverterPluginStore {
  userPlugins: ConverterPluginDefinition[]
  pluginConverter: PluginConverterState
  pluginDraft: string
  pluginManagerError: string | null

  setPluginId: (pluginId: string) => void
  setFromUnit: (fromUnit: string) => void
  setToUnit: (toUnit: string) => void
  setInputValue: (inputValue: string) => void

  setPluginDraft: (pluginDraft: string) => void
  addPluginFromDraft: () => void
  removeUserPlugin: (pluginId: string) => void

  clearPluginError: () => void
}

function selectFromAndToUnits(plugin: ConverterPluginDefinition): {
  fromUnit: string
  toUnit: string
} {
  const fromUnit = plugin.baseUnitKey
  const firstAlternative =
    plugin.units.find((unit) => unit.key !== fromUnit)?.key ?? fromUnit

  return {
    fromUnit,
    toUnit: firstAlternative,
  }
}

function resolvePluginConverter(
  converter: PluginConverterState,
  userPlugins: ConverterPluginDefinition[],
): PluginConverterState {
  const plugins = listAllConverterPlugins(userPlugins)
  const fallbackPlugin = plugins[0]

  if (!fallbackPlugin) {
    return {
      pluginId: '',
      fromUnit: '',
      toUnit: '',
      inputValue: converter.inputValue,
      outputValue: '',
      error: 'No converter plugins available',
    }
  }

  const selectedPlugin =
    plugins.find((plugin) => plugin.id === converter.pluginId) ?? fallbackPlugin

  const selection = selectFromAndToUnits(selectedPlugin)
  const fromUnit = selectedPlugin.units.some((unit) => unit.key === converter.fromUnit)
    ? converter.fromUnit
    : selection.fromUnit
  const toUnit = selectedPlugin.units.some((unit) => unit.key === converter.toUnit)
    ? converter.toUnit
    : selection.toUnit

  return {
    ...converter,
    pluginId: selectedPlugin.id,
    fromUnit,
    toUnit,
  }
}

function recalculatePluginConverter(
  converter: PluginConverterState,
  userPlugins: ConverterPluginDefinition[],
): PluginConverterState {
  const resolved = resolvePluginConverter(converter, userPlugins)
  const inputRaw = resolved.inputValue.trim()

  if (!inputRaw) {
    return {
      ...resolved,
      outputValue: '',
      error: null,
    }
  }

  const numeric = Number(inputRaw)
  if (!Number.isFinite(numeric)) {
    return {
      ...resolved,
      outputValue: '',
      error: 'Enter a valid number',
    }
  }

  try {
    const plugin = listAllConverterPlugins(userPlugins).find(
      (entry) => entry.id === resolved.pluginId,
    )

    if (!plugin) {
      return {
        ...resolved,
        outputValue: '',
        error: 'Converter plugin not found',
      }
    }

    const converted = convertWithPlugin(
      numeric,
      plugin,
      resolved.fromUnit,
      resolved.toUnit,
    )

    return {
      ...resolved,
      outputValue: formatNumber(converted, {
        maxFractionDigits: 12,
      }),
      error: null,
    }
  } catch (error) {
    return {
      ...resolved,
      outputValue: '',
      error: error instanceof Error ? error.message : 'Unable to convert value',
    }
  }
}

function createInitialState(): {
  pluginConverter: PluginConverterState
  userPlugins: ConverterPluginDefinition[]
} {
  const plugins = listAllConverterPlugins([])
  const fallback = plugins[0]

  if (!fallback) {
    return {
      userPlugins: [],
      pluginConverter: {
        pluginId: '',
        fromUnit: '',
        toUnit: '',
        inputValue: '1',
        outputValue: '',
        error: 'No converter plugins available',
      },
    }
  }

  const units = selectFromAndToUnits(fallback)

  return {
    userPlugins: [],
    pluginConverter: {
      pluginId: fallback.id,
      fromUnit: units.fromUnit,
      toUnit: units.toUnit,
      inputValue: '1',
      outputValue: '',
      error: null,
    },
  }
}

const initialState = createInitialState()
const initialConverter = recalculatePluginConverter(
  initialState.pluginConverter,
  initialState.userPlugins,
)

export const useConverterPluginStore = create<ConverterPluginStore>()(
  persist(
    (set, get) => ({
      userPlugins: initialState.userPlugins,
      pluginConverter: initialConverter,
      pluginDraft: '',
      pluginManagerError: null,

      setPluginId: (pluginId) => {
        set((state) => ({
          pluginConverter: recalculatePluginConverter(
            {
              ...state.pluginConverter,
              pluginId,
            },
            state.userPlugins,
          ),
          pluginManagerError: null,
        }))
      },

      setFromUnit: (fromUnit) => {
        set((state) => ({
          pluginConverter: recalculatePluginConverter(
            {
              ...state.pluginConverter,
              fromUnit,
            },
            state.userPlugins,
          ),
        }))
      },

      setToUnit: (toUnit) => {
        set((state) => ({
          pluginConverter: recalculatePluginConverter(
            {
              ...state.pluginConverter,
              toUnit,
            },
            state.userPlugins,
          ),
        }))
      },

      setInputValue: (inputValue) => {
        set((state) => ({
          pluginConverter: recalculatePluginConverter(
            {
              ...state.pluginConverter,
              inputValue,
            },
            state.userPlugins,
          ),
        }))
      },

      setPluginDraft: (pluginDraft) => set({ pluginDraft, pluginManagerError: null }),

      addPluginFromDraft: () => {
        const state = get()

        try {
          const plugin = parseConverterPluginJson(state.pluginDraft)
          const allPlugins = listAllConverterPlugins(state.userPlugins)

          if (allPlugins.some((entry) => entry.id === plugin.id)) {
            throw new Error(`Plugin with id "${plugin.id}" already exists`)
          }

          const userPlugins = [...state.userPlugins, plugin]
          const selection = selectFromAndToUnits(plugin)

          set({
            userPlugins,
            pluginConverter: recalculatePluginConverter(
              {
                ...state.pluginConverter,
                pluginId: plugin.id,
                fromUnit: selection.fromUnit,
                toUnit: selection.toUnit,
              },
              userPlugins,
            ),
            pluginDraft: '',
            pluginManagerError: null,
          })
        } catch (error) {
          set({
            pluginManagerError:
              error instanceof Error ? error.message : 'Unable to import plugin',
          })
        }
      },

      removeUserPlugin: (pluginId) => {
        set((state) => {
          const userPlugins = state.userPlugins.filter(
            (plugin) => plugin.id !== pluginId,
          )

          return {
            userPlugins,
            pluginConverter: recalculatePluginConverter(
              state.pluginConverter,
              userPlugins,
            ),
            pluginManagerError: null,
          }
        })
      },

      clearPluginError: () =>
        set((state) => ({
          pluginConverter: {
            ...state.pluginConverter,
            error: null,
          },
          pluginManagerError: null,
        })),
    }),
    {
      name: STORAGE_KEYS.converterPlugins,
      partialize: (state) => ({
        userPlugins: state.userPlugins,
        pluginConverter: state.pluginConverter,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return

          state.userPlugins = state.userPlugins
            .map((plugin) => {
              try {
                return sanitizeConverterPluginDefinition(plugin)
              } catch {
                return null
              }
            })
            .filter((entry): entry is ConverterPluginDefinition => entry !== null)

          state.pluginConverter = recalculatePluginConverter(
            state.pluginConverter,
            state.userPlugins,
          )
        }
      },
    },
  ),
)

