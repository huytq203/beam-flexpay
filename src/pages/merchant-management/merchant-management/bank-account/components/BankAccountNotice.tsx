import type { ReactNode } from 'react'

import { InfoCircleOutlined, WarningIcon } from '@components/icons'
import { cn } from '@utils/cn'

interface BankAccountNoticeProps {
  tone: 'info' | 'warning' | 'danger'
  children: ReactNode
  className?: string
}

const TONE_CLASS = {
  info: 'border-border bg-primary/10 text-secondary-foreground',
  warning: 'border-warning/40 bg-warning/10 text-warning-strong',
  danger: 'border-danger/30 bg-danger/10 text-danger-strong'
} as const

/** Dải thông báo tĩnh trong modal — nền tint, viền 1px, không đổ bóng. */
export function BankAccountNotice({
  tone,
  children,
  className
}: BankAccountNoticeProps) {
  const Icon = tone === 'info' ? InfoCircleOutlined : WarningIcon

  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed',
        TONE_CLASS[tone],
        className
      )}
    >
      <Icon
        aria-hidden
        className='mt-0.5 shrink-0 text-sm'
      />
      <span>{children}</span>
    </p>
  )
}
