import { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface GlassCardProps {
  className?: string
  children: ReactNode
}

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/20 bg-white/55 p-4 shadow-soft backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-900/45',
        className,
      )}
    >
      {children}
    </div>
  )
}

