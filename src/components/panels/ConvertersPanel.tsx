import { RefreshCw } from 'lucide-react'
import { unitCatalog } from '../../converters/unitCatalog'
import type { AppLanguageCode } from '../../i18n/languages'
import { pickUiText } from '../../i18n/uiText'
import {
  CurrencyConverterState,
  UnitConverterState,
  UnitCategory,
} from '../../types/calculator'

interface ConvertersPanelProps {
  mode: 'unit' | 'currency' | 'other'
  language: AppLanguageCode
  unitState: UnitConverterState
  currencyState: CurrencyConverterState
  supportedCurrencies: string[]
  onUnitCategoryChange: (category: UnitCategory) => void
  onUnitFromChange: (unit: string) => void
  onUnitToChange: (unit: string) => void
  onUnitInputChange: (value: string) => void
  onCurrencyBaseChange: (base: string) => Promise<void>
  onCurrencyQuoteChange: (quote: string) => void
  onCurrencyAmountChange: (amount: string) => void
  onCurrencyRefresh: () => Promise<void>
}

export function ConvertersPanel({
  mode,
  language,
  unitState,
  currencyState,
  supportedCurrencies,
  onUnitCategoryChange,
  onUnitFromChange,
  onUnitToChange,
  onUnitInputChange,
  onCurrencyBaseChange,
  onCurrencyQuoteChange,
  onCurrencyAmountChange,
  onCurrencyRefresh,
}: ConvertersPanelProps) {
  const unitConverterLabel = pickUiText(language, 'Unit converter', 'Конвертер единиц')
  const categoryLabel = pickUiText(language, 'Category', 'Категория')
  const valueLabel = pickUiText(language, 'Value', 'Значение')
  const fromLabel = pickUiText(language, 'From', 'Из')
  const toLabel = pickUiText(language, 'To', 'В')
  const resultLabel = pickUiText(language, 'Result', 'Результат')

  const currencyConverterLabel = pickUiText(
    language,
    'Currency converter',
    'Конвертер валют',
  )
  const refreshLabel = pickUiText(language, 'Refresh', 'Обновить')
  const amountLabel = pickUiText(language, 'Amount', 'Сумма')
  const baseLabel = pickUiText(language, 'Base', 'Базовая')
  const quoteLabel = pickUiText(language, 'Quote', 'Целевая')
  const convertedAmountLabel = pickUiText(
    language,
    'Converted amount',
    'Сконвертированная сумма',
  )
  const providerLabel = pickUiText(language, 'Provider', 'Провайдер')
  const autoRefreshLabel = pickUiText(
    language,
    'Auto-updates every 5 minutes while app is open.',
    'Автообновление каждые 5 минут, пока приложение открыто.',
  )
  const refreshingLabel = pickUiText(
    language,
    'Refreshing rates...',
    'Обновление курсов...',
  )
  const pickModeLabel = pickUiText(
    language,
    'Pick Units or Currency mode to open converter workspace.',
    'Выберите режим единиц или валют, чтобы открыть панель конвертера.',
  )

  if (mode === 'unit') {
    const units =
      unitCatalog.find((entry) => entry.key === unitState.category)?.units ?? []

    return (
      <section className="space-y-3 rounded-3xl border border-slate-300/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
          {unitConverterLabel}
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {categoryLabel}
            <select
              value={unitState.category}
              onChange={(event) =>
                onUnitCategoryChange(event.target.value as UnitCategory)
              }
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            >
              {unitCatalog.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {valueLabel}
            <input
              value={unitState.inputValue}
              onChange={(event) => onUnitInputChange(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            />
          </label>

          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {fromLabel}
            <select
              value={unitState.fromUnit}
              onChange={(event) => onUnitFromChange(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            >
              {units.map((unit) => (
                <option key={unit.key} value={unit.key}>
                  {unit.label} ({unit.symbol})
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {toLabel}
            <select
              value={unitState.toUnit}
              onChange={(event) => onUnitToChange(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            >
              {units.map((unit) => (
                <option key={unit.key} value={unit.key}>
                  {unit.label} ({unit.symbol})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-cyan-50/70 to-teal-50/70 p-4 dark:from-cyan-900/20 dark:to-teal-900/20">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {resultLabel}
          </p>
          <p className="font-display text-3xl text-slate-950 dark:text-white">
            {unitState.outputValue || '0'}
          </p>
          <p className="h-4 text-xs text-rose-500 dark:text-rose-300">
            {unitState.error ?? ' '}
          </p>
        </div>
      </section>
    )
  }

  if (mode === 'currency') {
    return (
      <section className="space-y-3 rounded-3xl border border-slate-300/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
            {currencyConverterLabel}
          </h3>
          <button
            type="button"
            onClick={() => void onCurrencyRefresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 px-3 py-1.5 text-xs text-slate-600 transition hover:border-cyan-400/70 dark:border-slate-700 dark:text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {refreshLabel}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {amountLabel}
            <input
              value={currencyState.amount}
              onChange={(event) => onCurrencyAmountChange(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            />
          </label>

          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {baseLabel}
            <select
              value={currencyState.base}
              onChange={(event) => void onCurrencyBaseChange(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            >
              {supportedCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {quoteLabel}
            <select
              value={currencyState.quote}
              onChange={(event) => onCurrencyQuoteChange(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            >
              {supportedCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-emerald-50/70 to-cyan-50/70 p-4 dark:from-emerald-900/20 dark:to-cyan-900/20">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {convertedAmountLabel}
          </p>
          <p className="font-display text-3xl text-slate-950 dark:text-white">
            {currencyState.outputValue || '0'}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {providerLabel}: {currencyState.providerName}
            {currencyState.lastUpdatedAt
              ? ` | ${new Date(currencyState.lastUpdatedAt).toLocaleString(language)}`
              : ''}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {autoRefreshLabel}
          </p>
          <p className="h-4 text-xs text-rose-500 dark:text-rose-300">
            {currencyState.error ?? (currencyState.isLoading ? refreshingLabel : ' ')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/70 p-4 text-sm text-slate-600 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
      {pickModeLabel}
    </section>
  )
}
