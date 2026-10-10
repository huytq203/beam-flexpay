import type { ColumnsType } from 'antd/es/table'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { cn } from '@utils/cn'
import { formatNumber } from '@utils/index'

export const amountColumns: ColumnsType<UnifiedContentJournal> = [
  {
    title: 'Số tiền gốc',
    align: 'right',
    render(value, record) {
      return (
        <div className='text-right font-medium'>
          <p>{formatNumber(record.amount) + ' ' + record.currency}</p>
        </div>
      )
    }
  },
  {
    title: 'Phí',
    align: 'right',
    render(value, record) {
      return (
        <div className='text-right text-gray-500'>
          <p>{formatNumber(record.feeAmount) + ' ' + record.currency}</p>
        </div>
      )
    }
  },
  {
    title: 'Tổng',
    align: 'right',
    render(value, record) {
      const isDebit =
        record.transactionType === 'CASH_OUT' ||
        record.transactionType === 'MERCHANT_PAYMENT'
      return isDebit ? (
        <div className='text-right font-medium text-red'>
          <p>-{formatNumber(record.grossAmount) + ' ' + record.currency}</p>
        </div>
      ) : (
        <div className='text-right font-medium text-green'>
          <p>+{formatNumber(record.grossAmount) + ' ' + record.currency}</p>
        </div>
      )
    }
  },
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
