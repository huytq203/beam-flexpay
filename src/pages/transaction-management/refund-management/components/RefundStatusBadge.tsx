import { cn } from '@lib/utils/cn'
import {
  REFUND_STATUS_LABELS,
  type RefundTone
} from '../constants/refund.constants'
import type { RefundStatus } from '../schemas/refund.schema'

const TONE_CLASS: Record<RefundTone, string> = {
  success: 'bg-success/10 text-success-strong',
  warning: 'bg-warning/10 text-warning-strong',
  danger: 'bg-danger/10 text-danger-strong',
  info: 'bg-primary/10 text-secondary-foreground',
  normal: 'bg-muted text-muted-foreground'
}

interface RefundStatusBadgeProps {
  status: RefundStatus
}

export function RefundStatusBadge({ status }: RefundStatusBadgeProps) {
  const known = REFUND_STATUS_LABELS[status] as
    | (typeof REFUND_STATUS_LABELS)[RefundStatus]
    | undefined
  return (
    <span
      className={cn(
        'inline-block rounded-md px-2 py-0.5 text-xs font-semibold',
        TONE_CLASS[known?.tone ?? 'normal']
      )}
    >
      {known?.label ?? status}
    </span>
  )
}
