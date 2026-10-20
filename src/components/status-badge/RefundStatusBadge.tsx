import {
  REFUND_DISPLAY_STATUS_LABELS,
  type RefundDisplayStatus
} from '@constants/refund.constant'
import { StatusToneBadge } from './StatusToneBadge'

interface RefundStatusBadgeProps {
  /** Truyền `displayStatus` khi có; giá trị lạ hiện nguyên văn với tông trung tính. */
  status: string
}

const isKnownStatus = (status: string): status is RefundDisplayStatus =>
  status in REFUND_DISPLAY_STATUS_LABELS

export function RefundStatusBadge({ status }: RefundStatusBadgeProps) {
  if (!isKnownStatus(status)) return <StatusToneBadge>{status}</StatusToneBadge>
  const { label, tone } = REFUND_DISPLAY_STATUS_LABELS[status]
  return <StatusToneBadge tone={tone}>{label}</StatusToneBadge>
}
