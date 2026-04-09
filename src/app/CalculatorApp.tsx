import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { History, Settings, Star } from 'lucide-react'
import { ExpressionDisplay } from '../components/calculator/ExpressionDisplay'
import { Keypad } from '../components/calculator/Keypad'
import { WindowTitleBar } from '../components/layout/WindowTitleBar'
import { ModeSelector } from '../components/calculator/ModeSelector'
import { GlassCard } from '../components/common/GlassCard'
import { ConvertersPanel } from '../components/panels/ConvertersPanel'
import { FavoritesPanel } from '../components/panels/FavoritesPanel'
import { GraphPanel } from '../components/panels/GraphPanel'
import { HistoryPanel } from '../components/panels/HistoryPanel'
import { SettingsPanel } from '../components/panels/SettingsPanel'
import { copyToClipboard } from '../desktop/bindings'
import { useCurrencyAutoRefresh } from '../hooks/useCurrencyAutoRefresh'
import { useKeyboardInput } from '../hooks/useKeyboardInput'
import { useLanguageSync } from '../hooks/useLanguageSync'
import { useThemeSync } from '../hooks/useThemeSync'
import { detectLanguageByIp } from '../providers/language/ipLanguageService'
import {
  supportedCurrencies,
  useCalculatorStore,
} from '../state/calculatorStore'
import { SidePanelTab } from '../types/calculator'
import { cn } from '../utils/cn'

const sideTabs: Array<{ id: SidePanelTab; label: string; icon: typeof History }> = [
  { id: 'history', label: 'History', icon: History },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function CalculatorApp() {
  useThemeSync()
  useLanguageSync()
  useKeyboardInput()
  useCurrencyAutoRefresh()

  const [copyStatus, setCopyStatus] = useState<'idle' | 'done'>('idle')

  const mode = useCalculatorStore((state) => state.mode)
  const sidePanelTab = useCalculatorStore((state) => state.sidePanelTab)
  const theme = useCalculatorStore((state) => state.theme)
  const language = useCalculatorStore((state) => state.language)
  const angleMode = useCalculatorStore((state) => state.angleMode)
  const programmerBase = useCalculatorStore((state) => state.programmerBase)
  const isAdvancedCollapsed = useCalculatorStore(
    (state) => state.isAdvancedCollapsed,
  )

  const expression = useCalculatorStore((state) => state.expression)
  const result = useCalculatorStore((state) => state.result)
  const preview = useCalculatorStore((state) => state.preview)
  const error = useCalculatorStore((state) => state.error)

  const history = useCalculatorStore((state) => state.history)
  const favorites = useCalculatorStore((state) => state.favorites)
  const memoryValue = useCalculatorStore((state) => state.memoryValue)

  const unitConverter = useCalculatorStore((state) => state.unitConverter)
  const currencyConverter = useCalculatorStore((state) => state.currencyConverter)
  const graph = useCalculatorStore((state) => state.graph)

  const setMode = useCalculatorStore((state) => state.setMode)
  const setSidePanelTab = useCalculatorStore((state) => state.setSidePanelTab)
  const setTheme = useCalculatorStore((state) => state.setTheme)
  const setLanguage = useCalculatorStore((state) => state.setLanguage)
  const setAngleMode = useCalculatorStore((state) => state.setAngleMode)
  const setProgrammerBase = useCalculatorStore((state) => state.setProgrammerBase)
  const toggleAdvancedCollapsed = useCalculatorStore(
    (state) => state.toggleAdvancedCollapsed,
  )

  const appendToken = useCalculatorStore((state) => state.appendToken)
  const evaluate = useCalculatorStore((state) => state.evaluate)
  const backspace = useCalculatorStore((state) => state.backspace)
  const clearExpression = useCalculatorStore((state) => state.clearExpression)
  const addFavorite = useCalculatorStore((state) => state.addFavorite)

  const memoryClear = useCalculatorStore((state) => state.memoryClear)
  const memoryRecall = useCalculatorStore((state) => state.memoryRecall)
  const memoryAdd = useCalculatorStore((state) => state.memoryAdd)
  const memorySubtract = useCalculatorStore((state) => state.memorySubtract)
  const memoryStore = useCalculatorStore((state) => state.memoryStore)

  const setUnitCategory = useCalculatorStore((state) => state.setUnitCategory)
  const setUnitFrom = useCalculatorStore((state) => state.setUnitFrom)
  const setUnitTo = useCalculatorStore((state) => state.setUnitTo)
  const setUnitInput = useCalculatorStore((state) => state.setUnitInput)

  const setCurrencyBase = useCalculatorStore((state) => state.setCurrencyBase)
  const setCurrencyQuote = useCalculatorStore((state) => state.setCurrencyQuote)
  const setCurrencyAmount = useCalculatorStore((state) => state.setCurrencyAmount)
  const refreshCurrencyRates = useCalculatorStore(
    (state) => state.refreshCurrencyRates,
  )

  const setGraphExpression = useCalculatorStore((state) => state.setGraphExpression)
  const setGraphWindow = useCalculatorStore((state) => state.setGraphWindow)
  const rebuildGraph = useCalculatorStore((state) => state.rebuildGraph)

  const clearHistory = useCalculatorStore((state) => state.clearHistory)
  const applyHistory = useCalculatorStore((state) => state.applyHistory)
  const applyFavorite = useCalculatorStore((state) => state.applyFavorite)
  const removeFavorite = useCalculatorStore((state) => state.removeFavorite)

  useEffect(() => {
    void refreshCurrencyRates({ force: true })
    rebuildGraph()
  }, [rebuildGraph, refreshCurrencyRates])

  const modeLabel = useMemo(() => {
    const map = {
      standard: 'Standard mode',
      scientific: 'Scientific mode',
      programmer: 'Programmer mode',
      unit: 'Unit converter',
      currency: 'Currency converter',
      graph: 'Graph mode',
    } satisfies Record<typeof mode, string>

    return map[mode]
  }, [mode])

  const handleCopy = async (): Promise<void> => {
    await copyToClipboard(result)
    setCopyStatus('done')

    window.setTimeout(() => {
      setCopyStatus('idle')
    }, 1000)
  }

  const converterMode =
    mode === 'unit' ? 'unit' : mode === 'currency' ? 'currency' : 'other'

  const handleDetectLanguageByIp = async () => {
    const detected = await detectLanguageByIp()
    setLanguage(detected)
    return detected
  }

  return (
    <div className="relative min-h-screen bg-app-gradient px-4 py-6 text-slate-900 transition-colors dark:text-slate-100 md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.13),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(5,150,105,0.16),transparent_40%)]" />
      <div className="pointer-events-none absolute -left-16 top-12 h-52 w-52 rounded-full bg-cyan-300/30 blur-3xl animate-ambient-float dark:bg-cyan-600/25" />
      <div className="pointer-events-none absolute bottom-10 right-8 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl animate-ambient-float-delayed dark:bg-emerald-600/20" />

      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
        className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-4"
      >
        <WindowTitleBar subtitle={modeLabel} />

        <GlassCard className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">
                GreatCalc
              </p>
              <h1 className="mt-2 font-display text-3xl leading-tight text-slate-950 dark:text-white md:text-4xl">
                Premium Desktop Calculator
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Crafted for speed and precision: scientific math, programmer tools,
                conversion workspace, and a real-time graph lab in one focused
                interface.
              </p>
            </div>

            <div
              className={cn(
                'rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition',
                copyStatus === 'done'
                  ? 'border-emerald-400/70 bg-emerald-100/60 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'border-slate-300/70 bg-white/70 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300',
              )}
            >
              {copyStatus === 'done' ? 'Copied' : 'Ready'}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <ModeSelector
            mode={mode}
            isCollapsed={isAdvancedCollapsed}
            onModeChange={setMode}
            onToggleCollapsed={toggleAdvancedCollapsed}
          />
        </GlassCard>

        <div
          className={cn(
            'grid gap-4',
            isAdvancedCollapsed ? 'grid-cols-1 xl:grid-cols-[1.5fr_0.8fr]' : 'grid-cols-1 xl:grid-cols-[1.9fr_1fr]',
          )}
        >
          <div className="space-y-4">
            <ExpressionDisplay
              expression={expression}
              result={result}
              preview={preview}
              error={error}
              modeLabel={modeLabel}
              angleLabel={angleMode.toUpperCase()}
              memoryValue={memoryValue}
              onCopy={() => void handleCopy()}
              onSaveFavorite={() => addFavorite()}
            />

            {!isAdvancedCollapsed && (
              <AnimatePresence mode="wait">
                {mode === 'graph' && (
                  <motion.div
                    key="graph"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GraphPanel
                      graph={graph}
                      onExpressionChange={setGraphExpression}
                      onWindowChange={setGraphWindow}
                      onRebuild={rebuildGraph}
                    />
                  </motion.div>
                )}

                {(mode === 'unit' || mode === 'currency' || mode === 'standard') && (
                  <motion.div
                    key="converter"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ConvertersPanel
                      mode={converterMode}
                      language={language}
                      unitState={unitConverter}
                      currencyState={currencyConverter}
                      supportedCurrencies={supportedCurrencies}
                      onUnitCategoryChange={setUnitCategory}
                      onUnitFromChange={setUnitFrom}
                      onUnitToChange={setUnitTo}
                      onUnitInputChange={setUnitInput}
                      onCurrencyBaseChange={setCurrencyBase}
                      onCurrencyQuoteChange={setCurrencyQuote}
                      onCurrencyAmountChange={setCurrencyAmount}
                      onCurrencyRefresh={() => refreshCurrencyRates({ force: true })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <Keypad
              mode={mode}
              angleMode={angleMode}
              programmerBase={programmerBase}
              onAngleModeChange={setAngleMode}
              onBaseChange={setProgrammerBase}
              onAppend={appendToken}
              onEvaluate={evaluate}
              onBackspace={backspace}
              onClear={clearExpression}
              onMemoryClear={memoryClear}
              onMemoryRecall={memoryRecall}
              onMemoryAdd={memoryAdd}
              onMemorySubtract={memorySubtract}
              onMemoryStore={memoryStore}
            />
          </div>

          <GlassCard className="h-fit min-h-[420px]">
            <div className="mb-3 grid grid-cols-3 gap-2">
              {sideTabs.map((tab) => {
                const Icon = tab.icon
                const active = tab.id === sidePanelTab

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSidePanelTab(tab.id)}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-semibold transition',
                      active
                        ? 'border-cyan-400/80 bg-cyan-500 text-white'
                        : 'border-slate-300/70 bg-white/70 text-slate-600 hover:border-cyan-400/70 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              {sidePanelTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}
                >
                  <HistoryPanel
                    language={language}
                    history={history}
                    onUse={applyHistory}
                    onClear={clearHistory}
                  />
                </motion.div>
              )}

              {sidePanelTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}
                >
                  <FavoritesPanel
                    favorites={favorites}
                    onUse={applyFavorite}
                    onRemove={removeFavorite}
                  />
                </motion.div>
              )}

              {sidePanelTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}
                >
                  <SettingsPanel
                    theme={theme}
                    language={language}
                    angleMode={angleMode}
                    onThemeChange={setTheme}
                    onLanguageChange={setLanguage}
                    onDetectLanguageByIp={handleDetectLanguageByIp}
                    onAngleModeChange={setAngleMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </motion.main>
    </div>
  )
}

