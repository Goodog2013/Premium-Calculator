import { motion } from 'framer-motion'
import { Divide, Minimize2, Sigma } from 'lucide-react'

interface SymbolicPanelProps {
  solveExpression: string
  solveVariable: string
  solveResult: string
  factorExpression: string
  factorResult: string
  simplifyExpression: string
  simplifyResult: string
  error: string | null

  onSolveExpressionChange: (expression: string) => void
  onSolveVariableChange: (variable: string) => void
  onSolve: () => void
  onFactorExpressionChange: (expression: string) => void
  onFactorize: () => void
  onSimplifyExpressionChange: (expression: string) => void
  onSimplify: () => void
}

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

export function SymbolicPanel({
  solveExpression,
  solveVariable,
  solveResult,
  factorExpression,
  factorResult,
  simplifyExpression,
  simplifyResult,
  error,
  onSolveExpressionChange,
  onSolveVariableChange,
  onSolve,
  onFactorExpressionChange,
  onFactorize,
  onSimplifyExpressionChange,
  onSimplify,
}: SymbolicPanelProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-slate-300/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
          Symbolic lab
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Equations, factorization, simplification
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-slate-300/70 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/70"
        >
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
            <Divide className="h-3.5 w-3.5" /> Solve equation
          </p>

          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Equation
            <input
              value={solveExpression}
              onChange={(event) => onSolveExpressionChange(event.target.value)}
              placeholder="x^2 - 5*x + 6 = 0"
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 font-mono text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            />
          </label>

          <label className="mt-2 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Variable
            <input
              value={solveVariable}
              onChange={(event) => onSolveVariableChange(event.target.value)}
              placeholder="x"
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 font-mono text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            />
          </label>

          <button
            type="button"
            onClick={onSolve}
            className="mt-3 w-full rounded-xl border border-cyan-400/70 bg-cyan-100/70 px-3 py-2 text-xs font-semibold text-cyan-900 transition hover:bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-200 dark:hover:bg-cyan-500/30"
          >
            Solve
          </button>

          <p className="mt-2 min-h-5 rounded-lg bg-slate-100/70 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            {solveResult || ' '}
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2, delay: 0.04 }}
          className="rounded-2xl border border-slate-300/70 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/70"
        >
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
            <Sigma className="h-3.5 w-3.5" /> Factorize
          </p>

          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Polynomial / expression
            <input
              value={factorExpression}
              onChange={(event) => onFactorExpressionChange(event.target.value)}
              placeholder="x^3 - 1"
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 font-mono text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            />
          </label>

          <button
            type="button"
            onClick={onFactorize}
            className="mt-3 w-full rounded-xl border border-emerald-400/70 bg-emerald-100/70 px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
          >
            Factorize
          </button>

          <p className="mt-2 min-h-5 rounded-lg bg-slate-100/70 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            {factorResult || ' '}
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2, delay: 0.08 }}
          className="rounded-2xl border border-slate-300/70 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/70"
        >
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
            <Minimize2 className="h-3.5 w-3.5" /> Simplify
          </p>

          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Expression
            <input
              value={simplifyExpression}
              onChange={(event) => onSimplifyExpressionChange(event.target.value)}
              placeholder="(x^2 - 1)/(x - 1)"
              className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 font-mono text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
            />
          </label>

          <button
            type="button"
            onClick={onSimplify}
            className="mt-3 w-full rounded-xl border border-violet-400/70 bg-violet-100/70 px-3 py-2 text-xs font-semibold text-violet-900 transition hover:bg-violet-100 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
          >
            Simplify
          </button>

          <p className="mt-2 min-h-5 rounded-lg bg-slate-100/70 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            {simplifyResult || ' '}
          </p>
        </motion.div>
      </div>

      <p className="h-4 text-xs text-rose-500 dark:text-rose-300">{error ?? ' '}</p>
    </section>
  )
}

