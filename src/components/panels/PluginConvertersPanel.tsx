import { useMemo, useState } from 'react'
import { ChevronDown, PlugZap, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { AppLanguageCode } from '../../i18n/languages'
import { pickUiText } from '../../i18n/uiText'
import {
  ConverterPluginDefinition,
  PluginConverterState,
} from '../../types/calculator'
import { cn } from '../../utils/cn'

interface PluginConvertersPanelProps {
  language: AppLanguageCode
  plugins: ConverterPluginDefinition[]
  userPluginIds: string[]
  pluginState: PluginConverterState
  pluginDraft: string
  pluginManagerError: string | null
  onPluginChange: (pluginId: string) => void
  onFromUnitChange: (fromUnit: string) => void
  onToUnitChange: (toUnit: string) => void
  onInputChange: (value: string) => void
  onPluginDraftChange: (draft: string) => void
  onAddPlugin: () => void
  onRemovePlugin: (pluginId: string) => void
}

const pluginTemplate = `{
  "id": "coffee-ratio",
  "name": "Coffee Ratio",
  "description": "Water/coffee brew ratio calculator.",
  "category": "Cooking",
  "baseUnitKey": "grams",
  "units": [
    {
      "key": "grams",
      "label": "Grams",
      "symbol": "g",
      "toBaseFormula": "value",
      "fromBaseFormula": "value"
    },
    {
      "key": "ounces",
      "label": "Ounces",
      "symbol": "oz",
      "toBaseFormula": "value * 28.349523125",
      "fromBaseFormula": "value / 28.349523125"
    }
  ]
}`

export function PluginConvertersPanel({
  language,
  plugins,
  userPluginIds,
  pluginState,
  pluginDraft,
  pluginManagerError,
  onPluginChange,
  onFromUnitChange,
  onToUnitChange,
  onInputChange,
  onPluginDraftChange,
  onAddPlugin,
  onRemovePlugin,
}: PluginConvertersPanelProps) {
  const [isManagerOpen, setIsManagerOpen] = useState(false)

  const selectedPlugin = useMemo(
    () => plugins.find((plugin) => plugin.id === pluginState.pluginId) ?? plugins[0],
    [pluginState.pluginId, plugins],
  )

  const titleLabel = pickUiText(language, 'Plugin converters', 'Плагинные конвертеры')
  const managerLabel = pickUiText(language, 'Plugin manager', 'Менеджер плагинов')
  const pluginLabel = pickUiText(language, 'Plugin', 'Плагин')
  const valueLabel = pickUiText(language, 'Value', 'Значение')
  const fromLabel = pickUiText(language, 'From', 'Из')
  const toLabel = pickUiText(language, 'To', 'В')
  const convertedValueLabel = pickUiText(language, 'Converted value', 'Результат')
  const fallbackDescription = pickUiText(
    language,
    'Custom formula-based converter',
    'Кастомный конвертер на формулах',
  )
  const importJsonLabel = pickUiText(language, 'Import plugin JSON', 'Импорт JSON плагина')
  const addPluginLabel = pickUiText(language, 'Add plugin', 'Добавить плагин')
  const userDeleteHint = pickUiText(
    language,
    'Only user plugins can be deleted. Built-ins are read-only.',
    'Удаляются только пользовательские плагины. Встроенные доступны только для чтения.',
  )
  const removeLabel = pickUiText(language, 'Remove', 'Удалить')
  const builtInLabel = pickUiText(language, 'Built-in', 'Встроенный')

  const units = selectedPlugin?.units ?? []

  return (
    <section className="space-y-3 rounded-3xl border border-slate-300/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
          <PlugZap className="h-3.5 w-3.5" /> {titleLabel}
        </h3>

        <button
          type="button"
          onClick={() => setIsManagerOpen((value) => !value)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-300/70 px-3 py-1.5 text-xs text-slate-600 transition hover:border-cyan-400/70 dark:border-slate-700 dark:text-slate-300"
        >
          {managerLabel}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              isManagerOpen && 'rotate-180',
            )}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 xl:col-span-2">
          {pluginLabel}
          <select
            value={pluginState.pluginId}
            onChange={(event) => onPluginChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          >
            {plugins.map((plugin) => (
              <option key={plugin.id} value={plugin.id}>
                {plugin.name} ({plugin.category})
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {valueLabel}
          <input
            value={pluginState.inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          />
        </label>

        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {fromLabel}
          <select
            value={pluginState.fromUnit}
            onChange={(event) => onFromUnitChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          >
            {units.map((unit) => (
              <option key={unit.key} value={unit.key}>
                {unit.label} ({unit.symbol})
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 xl:col-start-3">
          {toLabel}
          <select
            value={pluginState.toUnit}
            onChange={(event) => onToUnitChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          >
            {units.map((unit) => (
              <option key={unit.key} value={unit.key}>
                {unit.label} ({unit.symbol})
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl bg-gradient-to-r from-indigo-50/70 to-cyan-50/70 p-4 dark:from-indigo-900/20 dark:to-cyan-900/20 xl:col-span-2">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {convertedValueLabel}
          </p>
          <p className="font-display text-3xl text-slate-950 dark:text-white">
            {pluginState.outputValue || '0'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {selectedPlugin?.description || fallbackDescription}
          </p>
          <p className="h-4 text-xs text-rose-500 dark:text-rose-300">
            {pluginState.error ?? ' '}
          </p>
        </div>
      </div>

      {isManagerOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60"
        >
          <p className="text-xs font-medium uppercase tracking-[0.11em] text-slate-600 dark:text-slate-300">
            {importJsonLabel}
          </p>

          <textarea
            value={pluginDraft}
            onChange={(event) => onPluginDraftChange(event.target.value)}
            placeholder={pluginTemplate}
            className="h-40 w-full rounded-xl border border-slate-300/70 bg-white/90 p-3 font-mono text-xs outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onAddPlugin}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/70 bg-cyan-100/70 px-3 py-2 text-xs font-semibold text-cyan-900 transition hover:bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-200 dark:hover:bg-cyan-500/30"
            >
              <Plus className="h-3.5 w-3.5" /> {addPluginLabel}
            </button>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {userDeleteHint}
            </p>
          </div>

          <p className="h-4 text-xs text-rose-500 dark:text-rose-300">
            {pluginManagerError ?? ' '}
          </p>

          <div className="space-y-2">
            {plugins.map((plugin) => {
              const isUser = userPluginIds.includes(plugin.id)

              return (
                <div
                  key={plugin.id}
                  className="flex items-center justify-between rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {plugin.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {plugin.id} - {plugin.category}
                    </p>
                  </div>

                  {isUser ? (
                    <button
                      type="button"
                      onClick={() => onRemovePlugin(plugin.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-300/80 bg-rose-100/60 px-2 py-1 text-rose-700 transition hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {removeLabel}
                    </button>
                  ) : (
                    <span className="rounded-lg border border-slate-300/70 px-2 py-1 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      {builtInLabel}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </section>
  )
}
