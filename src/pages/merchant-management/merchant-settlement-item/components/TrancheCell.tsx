import { formatOrderMoney } from '../../merchant-order/utils/merchantOrder.utils'
import type { SettlementLineStatus } from '../types/settlementItem.types'
import { SettlementStatusTag } from './SettlementStatusTag'

interface Props {
  amount: number
  status: SettlementLineStatus | null
  withdrawalId: string | null
}

const shortId = (id: string): string => id.slice(0, 8)

/** Số tiền của một đợt, trạng thái và lệnh rút đang chứa/đã chi đợt đó. */
export function TrancheCell({ amount, status, withdrawalId }: Props) {
  return (
    <div className='flex flex-col items-end gap-1'>
      <span className='tabular-nums'>{formatOrderMoney(amount)}</span>
      <SettlementStatusTag status={status} />
      {withdrawalId && (
        <span
          className='text-xs text-muted-foreground'
          title={withdrawalId}
        >
          Lệnh rút {shortId(withdrawalId)}
        </span>
      )}
    </div>
  )
}
