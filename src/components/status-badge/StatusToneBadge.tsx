import type { ReactNode } from 'react'
import { cn } from '@lib/utils/cn'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'normal'

/** Chữ dùng biến thể `-strong` để đạt tương phản trên nền wash 10%. */
const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  success: 'bg-success/10 text-success-strong',
  warning: 'bg-warning/10 text-warning-strong',
  danger: 'bg-danger/10 text-danger-strong',
  info: 'bg-primary/10 text-secondary-foreground',
  normal: 'bg-muted text-muted-foreground'
}

export interface StatusToneBadgeProps {
  tone?: StatusTone
  className?: string
  children: ReactNode
}

/**
 * Badge trạng thái chuẩn của hệ thống (lấy từ màn Quản lý hoàn tiền): bo 6px,
 * chữ 12px đậm, không viền, không chữ hoa, không xuống dòng.
 */
export function StatusToneBadge({
  tone = 'normal',
  className,
  children
}: StatusToneBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        STATUS_TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
