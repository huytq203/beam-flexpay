import {
  StatusToneBadge,
  type StatusTone
} from '@components/status-badge/StatusToneBadge'
import type { WithdrawalStatusTone } from '@type/withdrawalApproval.type'
import { getWithdrawalStatusPresentation } from '@utils/withdrawal-approval'

/**
 * `APPROVED` và `PAYING` cố tình mang tông chờ chứ không phải tông thành công:
 * ở hai trạng thái đó tiền vẫn còn nguyên trong ngân hàng. Chỉ `POSTED` được
 * phép xanh.
 */
const TONE: Record<WithdrawalStatusTone, StatusTone> = {
  neutral: 'normal',
  wait: 'warning',
  done: 'success',
  stop: 'danger'
}

export interface WithdrawalStatusTagProps {
  status?: string | null
  className?: string
}

export const WithdrawalStatusTag = ({
  status,
  className
}: WithdrawalStatusTagProps) => {
  if (!status) return null

  const presentation = getWithdrawalStatusPresentation(status)

  return (
    <StatusToneBadge
      className={className}
      tone={TONE[presentation?.tone ?? 'neutral']}
    >
      {presentation?.label ?? status}
    </StatusToneBadge>
  )
}
