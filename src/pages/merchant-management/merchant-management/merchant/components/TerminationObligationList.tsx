import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent } from '@components/index'
import type { TerminationObligation } from '@type/merchant'
import { formatCurrency } from '@utils/formatNumber'

interface TerminationObligationListProps {
  obligations: TerminationObligation[]
  isFetching: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
}

/** SUB_* là số dư VND; WITHDRAWAL_IN_FLIGHT, ESCROW_ORDER_PENDING, OPEN_REFUNDS là số lượng. */
const formatAmount = ({ code, amount }: TerminationObligation): string =>
  code.startsWith('SUB_')
    ? formatCurrency(amount)
    : `${amount.toLocaleString('vi-VN')} giao dịch`

export function TerminationObligationList({
  obligations,
  isFetching,
  isError,
  error,
  onRetry
}: TerminationObligationListProps) {
  if (isFetching)
    return (
      <p
        role='status'
        className='text-sm text-muted-foreground'
      >
        Đang kiểm tra nghĩa vụ còn tồn đọng…
      </p>
    )

  if (isError)
    return (
      <div
        role='alert'
        className='flex flex-wrap items-center gap-2 text-sm text-danger-strong'
      >
        {getApiErrorDetail(error, 'Không kiểm tra được nghĩa vụ tồn đọng.')}
        <ButtonComponent
          htmlType='button'
          type='default'
          size='small'
          content='Thử lại'
          onClick={onRetry}
        />
      </div>
    )

  if (obligations.length === 0)
    return (
      <p className='text-sm text-muted-foreground'>
        Không còn nghĩa vụ tồn đọng.
      </p>
    )

  return (
    <div
      role='alert'
      aria-label='Nghĩa vụ chưa hoàn tất'
      className='space-y-2 rounded border border-border bg-muted/30 p-3'
    >
      <p className='text-sm font-medium text-danger-strong'>
        Cần xử lý {obligations.length} nghĩa vụ trước khi chấm dứt hợp tác:
      </p>
      <ul className='space-y-2 text-sm'>
        {obligations.map((item, index) => (
          <li key={`${item.code}-${item.subMerchantId ?? index}`}>
            <p className='font-medium text-foreground'>
              {item.message}
              {item.subCode ? ` (${item.subCode})` : ''} · {formatAmount(item)}
            </p>
            <p className='text-xs text-muted-foreground'>{item.guidance}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
