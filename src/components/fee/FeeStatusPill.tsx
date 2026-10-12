import type { FeeEffectiveStatus } from '@/app/schemas/applicable-fee-rule.schema'
import {
  ASSIGNMENT_STATUS_CONFIG,
  EFFECTIVE_STATUS_CONFIG,
  POLICY_STATUS_CONFIG
} from '@constants/feeLabels'
import { cn } from '@lib/utils/cn'
import dayjs from 'dayjs'

/**
 * Pill trạng thái cho module phí.
 *
 * Không dùng lại các lớp `*-status` dùng chung: chúng đặt chữ ở tông nền
 * (`text-primary`, `text-warning`) lên chính tông đó pha 10%, nên tương phản
 * rơi xuống dưới ngưỡng đọc được. Bảng dưới lấy biến thể `-strong` mà hệ thiết
 * kế đã chuẩn bị sẵn cho đúng tình huống chữ nằm trực tiếp trên nền nhạt.
 */
const TONE: Readonly<Record<string, string>> = {
  INIT: 'bg-accent text-secondary-foreground',
  ACTIVE: 'bg-success/10 text-success-strong',
  INACTIVE: 'bg-muted text-muted-foreground',
  LOCKED: 'bg-warning/10 text-warning-strong',
  REJECTED: 'bg-danger/10 text-danger-strong'
}

/** Tông cho trạng thái hiệu lực; chỉ PENDING/EXPIRED ghi đè nhãn "Đang áp dụng". */
const EFFECTIVE_TONE: Readonly<Partial<Record<FeeEffectiveStatus, string>>> = {
  PENDING: 'bg-warning/10 text-warning-strong',
  EXPIRED: 'bg-danger/10 text-danger-strong'
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
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-md px-2 py-0.5',
        'text-[11px] font-semibold uppercase tracking-wide',
        (overridden && EFFECTIVE_TONE[overridden]) ||
          TONE[status] ||
          'bg-muted text-muted-foreground',
        className
      )}
    >
      {overridden
        ? EFFECTIVE_STATUS_CONFIG[overridden].label
        : (config?.label ?? status)}
    </span>
  )
}
