import { Clock3, Trash2 } from 'lucide-react'
import { HistoryEntry } from '../../types/calculator'

interface HistoryPanelProps {
  history: HistoryEntry[]
  onUse: (id: string) => void
  onClear: () => void
}

export function HistoryPanel({
  history,
  onUse,
  onClear,
}: HistoryPanelProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
          History
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300/70 px-2 py-1 text-xs text-slate-600 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-400/60 dark:hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <div className="max-h-[300px] space-y-2 overflow-auto pr-1">
        {history.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300/70 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <Clock3 className="mx-auto mb-2 h-4 w-4" />
            Your calculations will appear here.
          </div>
        )}

        {history.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onUse(entry.id)}
            className="w-full rounded-2xl border border-slate-300/70 bg-white/60 px-3 py-2 text-left transition hover:border-cyan-400/60 dark:border-slate-700 dark:bg-slate-900/55 dark:hover:border-cyan-500/60"
          >
            <p className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">
              {entry.expression}
            </p>
            <p className="truncate font-display text-lg text-slate-950 dark:text-white">
              {entry.result}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {new Date(entry.createdAt).toLocaleTimeString()}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}

