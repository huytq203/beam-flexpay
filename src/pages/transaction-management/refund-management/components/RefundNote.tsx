import type { ReactNode } from 'react'
import { cn } from '@lib/utils/cn'

type NoteTone = 'info' | 'warning' | 'danger'

interface RefundNoteProps {
  tone: NoteTone
  title?: string
  children: ReactNode
  className?: string
}

const TONE_CLASS: Record<NoteTone, string> = {
  info: 'border-border bg-muted text-foreground',
  warning: 'border-warning/30 bg-warning/10 text-warning-strong',
  danger: 'border-danger/30 bg-danger/10 text-danger-strong'
}

export function RefundNote({
  tone,
  title,
  children,
  className
}: RefundNoteProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'note'}
      className={cn(
        'rounded-xl border p-3 text-sm',
        TONE_CLASS[tone],
        className
      )}
    >
      {title && <strong className='mr-1'>{title}</strong>}
      {children}
    </div>
  )
}
