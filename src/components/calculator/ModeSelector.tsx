import {
  ArrowLeftRight,
  Binary,
  Calculator,
  ChartSpline,
  DollarSign,
  FunctionSquare,
  Sigma,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { CalculatorMode } from '../../types/calculator'
import { cn } from '../../utils/cn'

const modeItems: Array<{
  id: CalculatorMode
  label: string
  description: string
  icon: typeof Calculator
}> = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Fast everyday calculations',
    icon: Calculator,
  },
  {
    id: 'scientific',
    label: 'Scientific',
    description: 'Trig, logs, powers',
    icon: Sigma,
  },
  {
    id: 'symbolic',
    label: 'Symbolic',
    description: 'Equations, factorization, simplify',
    icon: FunctionSquare,
  },
  {
    id: 'programmer',
    label: 'Programmer',
    description: 'Bitwise and base math',
    icon: Binary,
  },
  {
    id: 'unit',
    label: 'Units',
    description: 'Length, mass, data and more',
    icon: ArrowLeftRight,
  },
  {
    id: 'currency',
    label: 'Currency',
    description: 'Provider-backed FX conversion',
    icon: DollarSign,
  },
  {
    id: 'graph',
    label: 'Graph',
    description: 'Real-time function visualizer',
    icon: ChartSpline,
  },
]

interface ModeSelectorProps {
  mode: CalculatorMode
  isCollapsed: boolean
  onModeChange: (mode: CalculatorMode) => void
  onToggleCollapsed: () => void
}

export function ModeSelector({
  mode,
  isCollapsed,
  onModeChange,
  onToggleCollapsed,
}: ModeSelectorProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          Workspace
        </p>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="rounded-full border border-slate-300/70 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-cyan-400/70 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-400/70 dark:hover:text-white"
        >
          {isCollapsed ? 'Expand modules' : 'Compact view'}
        </button>
      </div>

      <motion.div
        layout
        className={cn(
          'grid gap-2',
          isCollapsed ? 'grid-cols-3 md:grid-cols-7' : 'grid-cols-2 md:grid-cols-4',
        )}
      >
        {modeItems.map((item) => {
          const Icon = item.icon
          const active = item.id === mode

          return (
            <motion.button
              key={item.id}
              layout
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -2 }}
              type="button"
              onClick={() => onModeChange(item.id)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition',
                active
                  ? 'border-cyan-400/70 bg-cyan-100/70 shadow-soft dark:bg-cyan-500/10'
                  : 'border-slate-300/70 bg-white/70 hover:border-cyan-300/60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-500',
              )}
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400/0 via-cyan-400/80 to-cyan-400/0 opacity-0 transition group-hover:opacity-100" />
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.label}
                </span>
              </div>
              {!isCollapsed && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </section>
  )
}

