import { AnimatePresence, motion } from 'framer-motion'
import { Delete, Equal } from 'lucide-react'
import type { AppLanguageCode } from '../../i18n/languages'
import { pickUiText } from '../../i18n/uiText'
import { AngleMode, CalculatorMode, ProgrammerBase } from '../../types/calculator'
import { cn } from '../../utils/cn'

interface KeypadProps {
  language: AppLanguageCode
  mode: CalculatorMode
  angleMode: AngleMode
  programmerBase: ProgrammerBase
  onAngleModeChange: (mode: AngleMode) => void
  onBaseChange: (base: ProgrammerBase) => void
  onAppend: (token: string) => void
  onEvaluate: () => void
  onBackspace: () => void
  onClear: () => void
  onMemoryClear: () => void
  onMemoryRecall: () => void
  onMemoryAdd: () => void
  onMemorySubtract: () => void
  onMemoryStore: () => void
}

type KeyDefinition = {
  key: string
  label: string
  token?: string
  className?: string
  variant?: 'default' | 'operator' | 'accent' | 'memory'
  action?: 'backspace' | 'evaluate' | 'clear'
}

const standardKeys: KeyDefinition[] = [
  { key: '(', label: '(', token: '(' },
  { key: ')', label: ')', token: ')' },
  { key: '%', label: '%', token: '%' },
  {
    key: 'backspace',
    label: '',
    action: 'backspace',
    variant: 'operator',
  },

  { key: '7', label: '7', token: '7' },
  { key: '8', label: '8', token: '8' },
  { key: '9', label: '9', token: '9' },
  { key: 'divide', label: '/', token: '/', variant: 'operator' },

  { key: '4', label: '4', token: '4' },
  { key: '5', label: '5', token: '5' },
  { key: '6', label: '6', token: '6' },
  { key: 'multiply', label: '*', token: '*', variant: 'operator' },

  { key: '1', label: '1', token: '1' },
  { key: '2', label: '2', token: '2' },
  { key: '3', label: '3', token: '3' },
  { key: 'minus', label: '-', token: '-', variant: 'operator' },

  { key: '0', label: '0', token: '0', className: 'col-span-2' },
  { key: 'dot', label: '.', token: '.' },
  { key: 'plus', label: '+', token: '+', variant: 'operator' },

  {
    key: 'equal',
    label: '',
    action: 'evaluate',
    className: 'col-span-4',
    variant: 'accent',
  },
]

const scientificExtras: KeyDefinition[] = [
  { key: 'sin', label: 'sin', token: 'sin(' },
  { key: 'cos', label: 'cos', token: 'cos(' },
  { key: 'tan', label: 'tan', token: 'tan(' },
  { key: 'sqrt', label: 'sqrt', token: 'sqrt(' },
  { key: 'pow', label: 'x^y', token: '^', variant: 'operator' },
  { key: 'log', label: 'log', token: 'log(' },
  { key: 'ln', label: 'ln', token: 'ln(' },
  { key: 'exp', label: 'exp', token: 'exp(' },
  { key: 'pi', label: 'pi', token: 'pi' },
  { key: 'e', label: 'e', token: 'e' },
  { key: 'abs', label: '|x|', token: 'abs(' },
  { key: 'clear', label: 'AC', action: 'clear', variant: 'operator' },
]

const programmerKeys: KeyDefinition[] = [
  { key: 'A', label: 'A', token: 'A' },
  { key: 'B', label: 'B', token: 'B' },
  { key: 'C', label: 'C', token: 'C' },
  { key: 'and', label: 'AND', token: '&', variant: 'operator' },

  { key: 'D', label: 'D', token: 'D' },
  { key: 'E', label: 'E', token: 'E' },
  { key: 'F', label: 'F', token: 'F' },
  { key: 'or', label: 'OR', token: '|', variant: 'operator' },

  { key: 'leftShift', label: '<<', token: '<<', variant: 'operator' },
  { key: 'rightShift', label: '>>', token: '>>', variant: 'operator' },
  { key: 'not', label: 'NOT', token: '~', variant: 'operator' },
  { key: 'xor', label: 'XOR', token: '^', variant: 'operator' },

  { key: '7', label: '7', token: '7' },
  { key: '8', label: '8', token: '8' },
  { key: '9', label: '9', token: '9' },
  { key: 'div', label: '/', token: '/', variant: 'operator' },

  { key: '4', label: '4', token: '4' },
  { key: '5', label: '5', token: '5' },
  { key: '6', label: '6', token: '6' },
  { key: 'mul', label: '*', token: '*', variant: 'operator' },

  { key: '1', label: '1', token: '1' },
  { key: '2', label: '2', token: '2' },
  { key: '3', label: '3', token: '3' },
  { key: 'minus', label: '-', token: '-', variant: 'operator' },

  { key: '0', label: '0', token: '0', className: 'col-span-2' },
  { key: 'mod', label: 'MOD', token: '%', variant: 'operator' },
  { key: 'plus', label: '+', token: '+', variant: 'operator' },

  {
    key: 'equal',
    label: '',
    action: 'evaluate',
    className: 'col-span-4',
    variant: 'accent',
  },
]

const memoryButtons: Array<{
  label: string
  action: () => void
}> = []

const baseOrder: ProgrammerBase[] = ['bin', 'oct', 'dec', 'hex']

function keyButtonClass(variant: KeyDefinition['variant'] = 'default'): string {
  if (variant === 'operator') {
    return 'border-slate-300/70 bg-slate-100/80 text-slate-900 accent-border-hover dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100'
  }

  if (variant === 'accent') {
    return 'accent-solid'
  }

  if (variant === 'memory') {
    return 'border-slate-300/60 bg-white/70 text-slate-700 accent-border-hover dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300'
  }

  return 'border-slate-300/70 bg-white/80 text-slate-900 accent-border-hover dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100'
}

export function Keypad({
  language,
  mode,
  angleMode,
  programmerBase,
  onAngleModeChange,
  onBaseChange,
  onAppend,
  onEvaluate,
  onBackspace,
  onClear,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryStore,
}: KeypadProps) {
  const evaluateLabel = pickUiText(language, 'Evaluate', 'Равно')
  const fullMode = mode === 'graph' || mode === 'symbolic' ? 'scientific' : mode

  const keys = fullMode === 'programmer' ? programmerKeys : standardKeys
  const topKeys = fullMode === 'scientific' ? scientificExtras : []

  memoryButtons.splice(
    0,
    memoryButtons.length,
    { label: 'MC', action: onMemoryClear },
    { label: 'MR', action: onMemoryRecall },
    { label: 'M+', action: onMemoryAdd },
    { label: 'M-', action: onMemorySubtract },
    { label: 'MS', action: onMemoryStore },
  )

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/75 p-4 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/65">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {memoryButtons.map((button) => (
            <button
              type="button"
              key={button.label}
              onClick={button.action}
              className={cn(
                'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                keyButtonClass('memory'),
              )}
            >
              {button.label}
            </button>
          ))}
        </div>

        {fullMode === 'scientific' && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/60 p-1 dark:border-slate-700 dark:bg-slate-900/70">
            {(['deg', 'rad'] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => onAngleModeChange(value)}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] transition',
                  angleMode === value
                    ? 'accent-solid'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        )}

        {fullMode === 'programmer' && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/60 p-1 dark:border-slate-700 dark:bg-slate-900/70">
            {baseOrder.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onBaseChange(value)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition',
                  programmerBase === value
                    ? 'accent-solid'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={fullMode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {topKeys.length > 0 && (
            <div className="grid grid-cols-6 gap-2">
              {topKeys.map((key) => (
                <button
                  key={key.key}
                  type="button"
                  onClick={() => {
                    if (key.action === 'clear') {
                      onClear()
                      return
                    }

                    if (key.token) onAppend(key.token)
                  }}
                  className={cn(
                    'rounded-xl border px-2 py-2 text-xs font-semibold transition',
                    keyButtonClass(key.variant),
                  )}
                >
                  {key.label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {keys.map((key) => (
              <button
                key={key.key}
                type="button"
                onClick={() => {
                  if (key.action === 'evaluate') {
                    onEvaluate()
                    return
                  }

                  if (key.action === 'backspace') {
                    onBackspace()
                    return
                  }

                  if (key.action === 'clear') {
                    onClear()
                    return
                  }

                  if (key.token) {
                    onAppend(key.token)
                  }
                }}
                className={cn(
                  'group relative h-12 rounded-xl border px-3 text-sm font-semibold transition',
                  keyButtonClass(key.variant),
                  key.className,
                )}
              >
                <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                {key.action === 'backspace' ? (
                  <Delete className="mx-auto h-4 w-4" />
                ) : key.action === 'evaluate' ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    {evaluateLabel} <Equal className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  key.label
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
