import { motion } from 'framer-motion'
import { Copy, Star } from 'lucide-react'
import type { AppLanguageCode } from '../../i18n/languages'
import { pickUiText } from '../../i18n/uiText'

interface ExpressionDisplayProps {
  language: AppLanguageCode
  expression: string
  result: string
  preview: string
  error: string | null
  modeLabel: string
  angleLabel: string
  memoryValue: number | null
  onCopy: () => void
  onSaveFavorite: () => void
}

export function ExpressionDisplay({
  language,
  expression,
  result,
  preview,
  error,
  modeLabel,
  angleLabel,
  memoryValue,
  onCopy,
  onSaveFavorite,
}: ExpressionDisplayProps) {
  const memEmpty = pickUiText(language, 'EMPTY', 'ПУСТО')
  const memSet = pickUiText(language, 'SET', 'ЕСТЬ')
  const errorLabel = pickUiText(language, 'Error', 'Ошибка')
  const saveLabel = pickUiText(language, 'Save', 'Сохранить')
  const copyLabel = pickUiText(language, 'Copy result', 'Копировать результат')

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-300/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cyan-300/30 via-cyan-300/0 to-transparent dark:from-cyan-500/20" />

      <div className="mb-4 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        <span>{modeLabel}</span>
        <div className="flex items-center gap-2">
          <span>{angleLabel}</span>
          <span className="rounded-full border border-slate-300/70 px-2 py-0.5 text-[10px] tracking-[0.15em] dark:border-slate-700">
            MEM {memoryValue === null ? memEmpty : memSet}
          </span>
        </div>
      </div>

      <div className="min-h-[70px] rounded-2xl bg-gradient-to-br from-white/80 to-cyan-50/40 p-4 dark:from-slate-800/80 dark:to-cyan-900/20">
        <p className="h-7 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-slate-600 dark:text-slate-300">
          {expression || '0'}
        </p>

        <motion.p
          key={result}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="h-10 overflow-hidden text-ellipsis whitespace-nowrap font-display text-3xl leading-10 text-slate-950 dark:text-white"
        >
          {error ? errorLabel : result}
        </motion.p>

        <p className="mt-1 h-5 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-cyan-700 dark:text-cyan-300">
          {preview && !error ? `≈ ${preview}` : ' '}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="min-h-5 text-xs text-rose-500 dark:text-rose-300">{error ?? ' '}</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveFavorite}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400/70 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-400/70 dark:hover:text-white"
          >
            <Star className="h-3.5 w-3.5" /> {saveLabel}
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/60 bg-cyan-100/70 px-3 py-2 text-xs font-semibold text-cyan-900 transition hover:bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-200 dark:hover:bg-cyan-500/30"
          >
            <Copy className="h-3.5 w-3.5" /> {copyLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
