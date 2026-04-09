import { motion } from 'framer-motion'
import { Maximize2, Minimize2, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  closeWindow,
  isTauriEnvironment,
  isWindowMaximized,
  minimizeWindow,
  subscribeWindowResize,
  toggleMaximizeWindow,
} from '../../desktop/bindings'
import { cn } from '../../utils/cn'

interface WindowTitleBarProps {
  subtitle: string
}

export function WindowTitleBar({ subtitle }: WindowTitleBarProps) {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    let cancelled = false
    let unlisten: (() => void) | null = null

    const syncState = async () => {
      const isMaximizedNow = await isWindowMaximized()
      if (!cancelled) {
        setMaximized(isMaximizedNow)
      }
    }

    void syncState()
    void subscribeWindowResize(() => {
      void syncState()
    }).then((dispose) => {
      if (cancelled) {
        dispose()
        return
      }
      unlisten = dispose
    })

    return () => {
      cancelled = true
      unlisten?.()
    }
  }, [])

  const handleToggleMaximize = async () => {
    await toggleMaximizeWindow()
    setMaximized((value) => !value)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between rounded-2xl border border-white/30 bg-white/65 px-3 py-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55"
      data-tauri-drag-region
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(140deg,rgba(34,211,238,0.12),transparent_45%)] dark:bg-[linear-gradient(140deg,rgba(14,116,144,0.2),transparent_45%)]" />

      <div
        className="relative flex items-center gap-2"
        data-tauri-drag-region={isTauriEnvironment() ? true : undefined}
      >
        <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400/90" />
        <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
          GreatCalc
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>
      </div>

      <div className="relative flex items-center gap-1">
        <button
          type="button"
          onClick={() => void minimizeWindow()}
          aria-label="Minimize window"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300/70 text-slate-600 transition',
            'hover:border-cyan-400/70 hover:bg-cyan-100/70 hover:text-slate-900',
            'dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500/60 dark:hover:bg-cyan-500/15 dark:hover:text-white',
          )}
        >
          <Minimize2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => void handleToggleMaximize()}
          aria-label={maximized ? 'Restore window' : 'Maximize window'}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300/70 text-slate-600 transition',
            'hover:border-cyan-400/70 hover:bg-cyan-100/70 hover:text-slate-900',
            'dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500/60 dark:hover:bg-cyan-500/15 dark:hover:text-white',
          )}
        >
          {maximized ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => void closeWindow()}
          aria-label="Close window"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300/70 text-rose-500 transition',
            'hover:border-rose-400/80 hover:bg-rose-100/70 hover:text-rose-600',
            'dark:border-rose-500/40 dark:text-rose-300 dark:hover:border-rose-400/80 dark:hover:bg-rose-500/20 dark:hover:text-rose-200',
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.header>
  )
}
