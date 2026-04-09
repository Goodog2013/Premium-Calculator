import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GraphState } from '../../types/calculator'

interface GraphPanelProps {
  graph: GraphState
  onExpressionChange: (expression: string) => void
  onWindowChange: (xMin: number, xMax: number) => void
  onRebuild: () => void
}

export function GraphPanel({
  graph,
  onExpressionChange,
  onWindowChange,
  onRebuild,
}: GraphPanelProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-slate-300/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
          Graph lab
        </h3>

        <button
          type="button"
          onClick={onRebuild}
          className="rounded-xl border border-slate-300/70 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-cyan-400/70 dark:border-slate-700 dark:text-slate-300"
        >
          Rebuild
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 md:col-span-3">
          f(x)
          <input
            value={graph.expression}
            onChange={(event) => onExpressionChange(event.target.value)}
            placeholder="sin(x) + x^2"
            className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 font-mono text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          />
        </label>

        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          X min
          <input
            type="number"
            value={graph.xMin}
            onChange={(event) =>
              onWindowChange(Number(event.target.value), graph.xMax)
            }
            className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          />
        </label>

        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          X max
          <input
            type="number"
            value={graph.xMax}
            onChange={(event) =>
              onWindowChange(graph.xMin, Number(event.target.value))
            }
            className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          />
        </label>

        <div className="rounded-xl border border-slate-300/70 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {graph.points.length} sampled points
        </div>
      </div>

      <div className="h-[280px] w-full overflow-hidden rounded-2xl border border-slate-300/70 bg-gradient-to-br from-white/80 to-cyan-50/40 p-2 dark:border-slate-700 dark:from-slate-900/80 dark:to-cyan-900/20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graph.points}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.25)" />
            <XAxis dataKey="x" stroke="currentColor" tick={{ fill: 'currentColor', fontSize: 12 }} />
            <YAxis stroke="currentColor" tick={{ fill: 'currentColor', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(100,116,139,0.35)',
                background: 'rgba(15,23,42,0.95)',
                color: '#f8fafc',
              }}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={350}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="h-4 text-xs text-rose-500 dark:text-rose-300">{graph.error ?? ' '}</p>
    </section>
  )
}

