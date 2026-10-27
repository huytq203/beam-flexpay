import { ButtonComponent } from '@components/index'
import { formatOrderMoney } from '../../merchant-order/utils/merchantOrder.utils'
import type { SettlementItemTotals as Totals } from '../types/settlementItem.types'
import { describeSettlementError } from '../utils/settlementItem.utils'

interface Props {
  totals?: Totals
  loading: boolean
  error?: unknown
  onRetry: () => void
}

const ITEMS: readonly {
  key: Exclude<keyof Totals, 'bySub'>
  label: string
  money: boolean
}[] = [
  { key: 'count', label: 'Số mục', money: false },
  { key: 'grossAmount', label: 'Khách trả', money: true },
  { key: 'feeAmount', label: 'Phí', money: true },
  { key: 'recognisedAmount', label: 'Doanh thu ghi nhận', money: true },
  { key: 'firstTrancheAmount', label: 'Đợt 1', money: true },
  { key: 'heldAmount', label: 'Đợt tạm giữ', money: true }
]

/** Tổng của toàn bộ khoảng lọc (truy vấn riêng), không phải của trang hiện tại. */
export function SettlementItemTotals({
  totals,
  loading,
  error,
  onRetry
}: Props) {
  if (error) {
    return (
      <div
        role='alert'
        className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
      >
        {describeSettlementError(error, 'totals')}
        <ButtonComponent
          size='small'
          type='default'
          content='Thử lại'
          onClick={onRetry}
        />
      </div>
    )
  }
  return (
    <dl
      aria-label='Tổng toàn bộ khoảng lọc'
      aria-busy={loading}
      className='mb-3 grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-3 sm:grid-cols-3 xl:grid-cols-6'
    >
      {ITEMS.map(({ key, label, money }) => (
        <div key={key}>
          <dt className='text-xs text-muted-foreground'>{label}</dt>
          <dd className='text-sm font-semibold tabular-nums text-foreground'>
            {totals
              ? money
                ? formatOrderMoney(totals[key])
                : totals[key]
              : '—'}
          </dd>
        </div>
      ))}
    </dl>
  )
}
