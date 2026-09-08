import { cn } from '@/lib/utils/cn'
import type { WithdrawalStatusTone } from '@type/withdrawalApproval.type'
import { getWithdrawalStatusPresentation } from '@utils/withdrawal-approval'

/**
 * `APPROVED` và `PAYING` cố tình mang tông chờ chứ không phải tông thành công:
 * ở hai trạng thái đó tiền vẫn còn nguyên trong ngân hàng. Chỉ `POSTED` được
 * phép xanh.
 */
const TONE_CLASS: Record<WithdrawalStatusTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  wait: 'border-warning-strong/30 bg-warning-strong/10 text-warning-strong',
  done: 'border-success-strong/30 bg-success-strong/10 text-success-strong',
  stop: 'border-danger-strong/30 bg-danger-strong/10 text-danger-strong'
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
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-sm border px-2 py-0.5 text-xs leading-4 font-semibold',
        TONE_CLASS[presentation?.tone ?? 'neutral'],
        className
      )}
    >
      {presentation?.label ?? status}
    </span>
  )
}
