import { Bookmark, Trash2 } from 'lucide-react'
import type { AppLanguageCode } from '../../i18n/languages'
import { pickUiText } from '../../i18n/uiText'
import { FavoriteEntry } from '../../types/calculator'

interface FavoritesPanelProps {
  language: AppLanguageCode
  favorites: FavoriteEntry[]
  onUse: (id: string) => void
  onRemove: (id: string) => void
}

export function FavoritesPanel({
  language,
  favorites,
  onUse,
  onRemove,
}: FavoritesPanelProps) {
  const titleLabel = pickUiText(language, 'Saved formulas', 'Сохраненные формулы')
  const emptyLabel = pickUiText(
    language,
    'Save frequent expressions for one-tap reuse.',
    'Сохраняйте частые выражения для быстрого повторного запуска.',
  )
  const removeLabel = pickUiText(language, 'Remove favorite', 'Удалить из избранного')

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
        {titleLabel}
      </h3>

      <div className="max-h-[300px] space-y-2 overflow-auto pr-1">
        {favorites.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300/70 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <Bookmark className="mx-auto mb-2 h-4 w-4" />
            {emptyLabel}
          </div>
        )}

        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="flex items-center gap-2 rounded-2xl border border-slate-300/70 bg-white/60 px-2 py-2 dark:border-slate-700 dark:bg-slate-900/55"
          >
            <button
              type="button"
              onClick={() => onUse(favorite.id)}
              className="flex-1 rounded-xl px-2 py-1 text-left transition hover:bg-cyan-100/70 dark:hover:bg-cyan-500/10"
            >
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                {favorite.label}
              </p>
              <p className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {favorite.expression}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onRemove(favorite.id)}
              className="rounded-lg border border-slate-300/70 p-2 text-slate-500 transition hover:border-rose-400/60 hover:text-rose-500 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-400/60 dark:hover:text-rose-300"
              aria-label={removeLabel}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
