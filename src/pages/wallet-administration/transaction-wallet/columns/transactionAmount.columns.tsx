import type { ColumnsType } from 'antd/es/table'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { cn } from '@utils/cn'
import { formatNumber } from '@utils/index'
import { transactionFlowColumns } from '@components/index'

export const amountColumns: ColumnsType<UnifiedContentJournal> = [
  ...transactionFlowColumns<UnifiedContentJournal>(),
  {
    title: 'Số tiền đang giữ',
    align: 'right',
    width: 170,
    render(_, record) {
      const heldAmount = record.freeze?.heldAmount ?? 0
      return (
        <span
          className={cn(
            'whitespace-nowrap font-medium tabular-nums',
            heldAmount > 0 ? 'amount-caution' : 'text-gray-500'
          )}
        >
          {formatNumber(heldAmount)} {record.currency}
        </span>
      )
    }
  }
]
