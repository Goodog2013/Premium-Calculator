import { LocateFixed, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { defaultLanguage, languageOptions } from '../../i18n/languages'
import type { AppLanguageCode } from '../../i18n/languages'
import { pickUiText } from '../../i18n/uiText'
import { accentOptions } from '../../theme/accentPalette'
import type { AccentColor, AngleMode, ThemeMode } from '../../types/calculator'
import { cn } from '../../utils/cn'

interface SettingsPanelProps {
  theme: ThemeMode
  accentColor: AccentColor
  language: AppLanguageCode
  angleMode: AngleMode
  onThemeChange: (theme: ThemeMode) => void
  onAccentColorChange: (accentColor: AccentColor) => void
  onLanguageChange: (language: AppLanguageCode) => void
  onDetectLanguageByIp: () => Promise<AppLanguageCode>
  onAngleModeChange: (mode: AngleMode) => void
}

export function SettingsPanel({
  theme,
  accentColor,
  language,
  angleMode,
  onThemeChange,
  onAccentColorChange,
  onLanguageChange,
  onDetectLanguageByIp,
  onAngleModeChange,
}: SettingsPanelProps) {
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false)
  const [detectLanguageNote, setDetectLanguageNote] = useState<string | null>(null)

  const settingsLabel = pickUiText(language, 'Settings', 'Настройки')
  const themeLabel = pickUiText(language, 'Theme', 'Тема')
  const themeLightLabel = pickUiText(language, 'Light', 'Светлая')
  const themeDarkLabel = pickUiText(language, 'Dark', 'Темная')
  const themeSystemLabel = pickUiText(language, 'System', 'Системная')
  const accentLabel = pickUiText(language, 'Accent color', 'Акцентный цвет')
  const languageLabel = pickUiText(
    language,
    'Language (50 most-used world languages)',
    'Язык (50 самых популярных языков мира)',
  )
  const detectLabel = pickUiText(language, 'Detect', 'Определить')
  const detectingLabel = pickUiText(language, 'Detecting', 'Определяем')
  const detectFailedLabel = pickUiText(
    language,
    'Could not detect language now. Try again.',
    'Не удалось определить язык. Попробуйте еще раз.',
  )
  const defaultLabel = pickUiText(language, 'Default', 'По умолчанию')
  const languageHint = pickUiText(
    language,
    'Affects number/date formatting and text direction.',
    'Влияет на формат чисел/дат и направление текста.',
  )
  const trigModeLabel = pickUiText(language, 'Default trig mode', 'Режим тригонометрии')
  const keyboardShortcutsLabel = pickUiText(
    language,
    'Keyboard shortcuts',
    'Горячие клавиши',
  )
  const shortcutsHint1 = pickUiText(
    language,
    'Enter = evaluate, Esc = clear, Backspace = delete.',
    'Enter = вычислить, Esc = очистить, Backspace = удалить символ.',
  )
  const shortcutsHint2 = pickUiText(
    language,
    'F1/F2/F3/F4/F5 switch standard/scientific/programmer/graph/symbolic modes.',
    'F1/F2/F3/F4/F5 переключают стандартный/научный/программист/график/символьный режимы.',
  )

  const handleDetectLanguage = async () => {
    setIsDetectingLanguage(true)
    setDetectLanguageNote(null)

    try {
      const detected = await onDetectLanguageByIp()
      const label = languageOptions.find((item) => item.code === detected)
      const detectedPrefix = pickUiText(language, 'Detected', 'Определен')
      setDetectLanguageNote(`${detectedPrefix}: ${label?.nativeName ?? detected}`)
    } catch {
      setDetectLanguageNote(detectFailedLabel)
    } finally {
      setIsDetectingLanguage(false)
    }
  }

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
        {settingsLabel}
      </h3>

      <div className="rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {themeLabel}
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as ThemeMode)}
            className="accent-focus mt-1 w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-900/80"
          >
            <option value="light">{themeLightLabel}</option>
            <option value="dark">{themeDarkLabel}</option>
            <option value="system">{themeSystemLabel}</option>
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {accentLabel}
        </p>

        <div className="mt-2 grid grid-cols-4 gap-2">
          {accentOptions.map((option) => {
            const active = option.id === accentColor
            const label = pickUiText(language, option.labelEn, option.labelRu)

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onAccentColorChange(option.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-2 py-2 text-[11px] font-semibold transition',
                  active
                    ? 'border-slate-900/70 bg-slate-100 text-slate-900 dark:border-white/60 dark:bg-slate-800 dark:text-white'
                    : 'border-slate-300/70 bg-white/80 text-slate-600 hover:border-slate-500/70 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300',
                )}
                aria-label={label}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: `rgb(${option.rgb.join(' ')})`,
                  }}
                />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {languageLabel}
        </p>

        <div className="mt-1 flex items-stretch gap-2">
          <select
            value={language}
            onChange={(event) =>
              onLanguageChange(event.target.value as AppLanguageCode)
            }
            aria-label={pickUiText(language, 'Language', 'Язык')}
            className="accent-focus w-full rounded-xl border border-slate-300/70 bg-white/90 px-3 py-2 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-900/80"
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
              'accent-soft inline-flex min-w-[104px] items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition',
              'disabled:cursor-not-allowed disabled:opacity-70',
            )}
          >
            <LocateFixed
              className={cn(
                'h-3.5 w-3.5',
                isDetectingLanguage && 'animate-spin',
              )}
            />
            {isDetectingLanguage ? detectingLabel : detectLabel}
          </button>
        </div>

        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          {defaultLabel}: {defaultLanguage} (English). {languageHint}
        </p>
        <p className="accent-note h-4 text-[11px]">{detectLanguageNote ?? ' '}</p>
      </div>

      <div className="rounded-2xl border border-slate-300/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
        <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          {trigModeLabel}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['deg', 'rad'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onAngleModeChange(value)}
              className={cn(
                'rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition',
                value === angleMode
                  ? 'accent-solid'
                  : 'border-slate-300/70 bg-white/80 text-slate-700 accent-border-hover dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300',
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300/70 bg-slate-50/50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/20 dark:text-slate-300">
        <p className="accent-note mb-2 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.14em]">
          <Sparkles className="h-3.5 w-3.5" /> {keyboardShortcutsLabel}
        </p>
        <p>{shortcutsHint1}</p>
        <p>{shortcutsHint2}</p>
      </div>
    </section>
  )
}
