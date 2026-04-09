import { LocateFixed, Sparkles } from 'lucide-react'
import { useState } from 'react'
import {
  defaultLanguage,
  languageOptions,
} from '../../i18n/languages'
import type { AppLanguageCode } from '../../i18n/languages'
import type { AngleMode, ThemeMode } from '../../types/calculator'
import { cn } from '../../utils/cn'

interface SettingsPanelProps {
  theme: ThemeMode
  language: AppLanguageCode
  angleMode: AngleMode
  onThemeChange: (theme: ThemeMode) => void
  onLanguageChange: (language: AppLanguageCode) => void
  onDetectLanguageByIp: () => Promise<AppLanguageCode>
  onAngleModeChange: (mode: AngleMode) => void
}

export function SettingsPanel({
  theme,
  language,
  angleMode,
  onThemeChange,
  onLanguageChange,
  onDetectLanguageByIp,
  onAngleModeChange,
}: SettingsPanelProps) {
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false)
  const [detectLanguageNote, setDetectLanguageNote] = useState<string | null>(null)

  const handleDetectLanguage = async () => {
    setIsDetectingLanguage(true)
    setDetectLanguageNote(null)

    try {
      const detected = await onDetectLanguageByIp()
      const label = languageOptions.find((item) => item.code === detected)
      setDetectLanguageNote(`Detected: ${label?.englishName ?? detected}`)
    } catch {
      setDetectLanguageNote('Could not detect language now. Try again.')
    } finally {
      setIsDetectingLanguage(false)
    }
  }

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
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Language (50 most-used world languages)
        </p>

        <div className="mt-1 flex items-stretch gap-2">
          <select
            value={language}
            onChange={(event) =>
              onLanguageChange(event.target.value as AppLanguageCode)
            }
            aria-label="Language"
            className="w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80 dark:border-slate-700 dark:bg-slate-900/80"
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.nativeName} ({option.englishName})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void handleDetectLanguage()}
            disabled={isDetectingLanguage}
            className={cn(
              'inline-flex min-w-[104px] items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition',
              'border-cyan-400/70 bg-cyan-100/70 text-cyan-900 hover:bg-cyan-100',
              'disabled:cursor-not-allowed disabled:opacity-70',
              'dark:border-cyan-500/60 dark:bg-cyan-500/15 dark:text-cyan-200 dark:hover:bg-cyan-500/25',
            )}
          >
            <LocateFixed
              className={cn(
                'h-3.5 w-3.5',
                isDetectingLanguage && 'animate-spin',
              )}
            />
            {isDetectingLanguage ? 'Detecting' : 'Detect'}
          </button>
        </div>

        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Default: {defaultLanguage} (English). Affects number/date formatting and
          text direction.
        </p>
        <p className="h-4 text-[11px] text-cyan-700 dark:text-cyan-300">
          {detectLanguageNote ?? ' '}
        </p>
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
        <p>F1/F2/F3/F4/F5 switch standard/scientific/programmer/graph/symbolic modes.</p>
      </div>
    </section>
  )
}


