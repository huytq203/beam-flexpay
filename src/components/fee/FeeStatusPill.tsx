import type { FeeEffectiveStatus } from '@/app/schemas/applicable-fee-rule.schema'
import {
  ASSIGNMENT_STATUS_CONFIG,
  EFFECTIVE_STATUS_CONFIG,
  POLICY_STATUS_CONFIG
} from '@constants/feeLabels'
import {
  StatusToneBadge,
  type StatusTone
} from '@components/status-badge/StatusToneBadge'
import dayjs from 'dayjs'

const TONE: Readonly<Record<string, StatusTone>> = {
  INIT: 'info',
  ACTIVE: 'success',
  INACTIVE: 'normal',
  LOCKED: 'warning',
  REJECTED: 'danger',
  EXPIRED: 'danger'
}

/** Tông cho trạng thái hiệu lực; chỉ PENDING/EXPIRED ghi đè nhãn "Đang áp dụng". */
const EFFECTIVE_TONE: Readonly<
  Partial<Record<FeeEffectiveStatus, StatusTone>>
> = {
  PENDING: 'warning',
  EXPIRED: 'danger'
}

export interface FeeStatusPillProps {
  status: string | null | undefined
  /** BE chỉ trả khi status = ACTIVE; thay nhãn "Hoạt động" bằng Chờ áp dụng / Đang áp dụng / Hết hạn. */
  effectiveStatus?: FeeEffectiveStatus | null
  /** Thời điểm hết hiệu lực; chính sách INIT đã quá hạn hiển thị là Hết hạn dù chưa được duyệt. */
  validTo?: string | null
  /** Bản gán có vòng đời riêng, nhãn khác chính sách ở trạng thái INIT. */
  kind?: 'policy' | 'assignment'
  className?: string
}

export const FeeStatusPill = ({
  status,
  effectiveStatus,
  validTo,
  kind = 'policy',
  className
}: FeeStatusPillProps) => {
  if (!status) return <span className='text-muted-foreground'>—</span>

  const config =
    kind === 'assignment'
      ? ASSIGNMENT_STATUS_CONFIG[status]
      : POLICY_STATUS_CONFIG[status]

  const isInitExpired =
    status === 'INIT' && !!validTo && dayjs(validTo).isBefore(dayjs())

  const overridden: FeeEffectiveStatus | null = isInitExpired
    ? 'EXPIRED'
    : status === 'ACTIVE' && effectiveStatus
      ? effectiveStatus
      : null

  return (
    <StatusToneBadge
      className={className}
      tone={
        (overridden && EFFECTIVE_TONE[overridden]) || TONE[status] || 'normal'
      }
    >
      {overridden
        ? EFFECTIVE_STATUS_CONFIG[overridden].label
        : (config?.label ?? status)}
    </StatusToneBadge>
  )
}
