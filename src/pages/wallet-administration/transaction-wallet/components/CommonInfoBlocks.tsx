import type { TransactionFreezeSummary } from '@type/apiResponseJournal'
import type { UnifiedRefundFields } from '@/app/schemas/unified-refund.schema'

type MoneyFormatter = (value: number) => string

interface RefundedAmountInfoProps {
  fields: UnifiedRefundFields
  pendingRefund: number | null
  formatMoney: MoneyFormatter
}

/** Chỉ hiện khi BE tra được số đã hoàn; `null` là chưa biết, không phải 0. */
export function RefundedAmountInfo({
  fields,
  pendingRefund,
  formatMoney
}: RefundedAmountInfoProps) {
  if (fields.refundedAmount == null) return null
  return (
    <div className='col-span-1'>
      <p className='text-gray-500'>Số tiền đã hoàn:</p>
      <p className='font-medium tabular-nums'>
        {formatMoney(fields.refundedAmount)}
      </p>
      {pendingRefund !== null && (
        <p className='amount-caution text-sm tabular-nums'>
          Đang chờ hoàn {formatMoney(pendingRefund)}
        </p>
      )}
    </div>
  )
}

interface FreezeNoticeProps {
  freeze: TransactionFreezeSummary
  formatMoney: MoneyFormatter
}

export function FreezeNotice({ freeze, formatMoney }: FreezeNoticeProps) {
  return (
    <div className='sm:col-span-2 xl:col-span-3 rounded-md border border-orange-200 bg-orange-50 p-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='font-medium text-orange-800'>
          Giao dịch đang có lệnh đóng băng
        </p>
        <p className='text-sm text-orange-700'>{freeze.orderCount} lệnh</p>
      </div>
      <div className='mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3'>
        <p>
          Yêu cầu: <strong>{formatMoney(freeze.requestedAmount)}</strong>
        </p>
        <p>
          Đã giữ: <strong>{formatMoney(freeze.heldAmount)}</strong>
        </p>
        <p>
          Còn thiếu: <strong>{formatMoney(freeze.shortfallAmount)}</strong>
        </p>
      </div>
    </div>
  )
}
