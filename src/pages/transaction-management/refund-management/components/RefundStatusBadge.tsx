import { StatusToneBadge } from '@components/status-badge/StatusToneBadge'
import { REFUND_STATUS_LABELS } from '../constants/refund.constants'
import type { RefundStatus } from '../schemas/refund.schema'

interface RefundStatusBadgeProps {
  status: RefundStatus
}

export function RefundStatusBadge({ status }: RefundStatusBadgeProps) {
  const known = REFUND_STATUS_LABELS[status] as
    | (typeof REFUND_STATUS_LABELS)[RefundStatus]
    | undefined
  return (
    <StatusToneBadge tone={known?.tone}>
      {known?.label ?? status}
    </StatusToneBadge>
  )
}
