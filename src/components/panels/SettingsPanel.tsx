import { Sparkles } from 'lucide-react'
import { AngleMode, ThemeMode } from '../../types/calculator'

interface SettingsPanelProps {
  theme: ThemeMode
  angleMode: AngleMode
  onThemeChange: (theme: ThemeMode) => void
  onAngleModeChange: (mode: AngleMode) => void
}

export function SettingsPanel({
  theme,
  angleMode,
  onThemeChange,
  onAngleModeChange,
}: SettingsPanelProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
        Settings
      </h3>

      <div className="rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Theme
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as ThemeMode)}
            className="mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
        <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          Default trig mode
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['deg', 'rad'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onAngleModeChange(value)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                value === angleMode
                  ? 'border-cyan-400/80 bg-cyan-500 text-white'
                  : 'border-slate-300/70 bg-white/80 text-slate-700 hover:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-cyan-300/60 bg-cyan-50/50 p-3 text-xs text-slate-600 dark:border-cyan-500/30 dark:bg-cyan-900/10 dark:text-slate-300">
        <p className="mb-2 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
          <Sparkles className="h-3.5 w-3.5" /> Keyboard shortcuts
        </p>
        <p>Enter = evaluate, Esc = clear, Backspace = delete.</p>
        <p>F1/F2/F3/F4 switch standard/scientific/programmer/graph modes.</p>
      </div>
    </section>
  )
}

