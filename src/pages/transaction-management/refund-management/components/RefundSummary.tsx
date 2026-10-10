import { REFUND_CHANNEL_LABELS } from '../constants/refund.constants'
import type { RefundListItem } from '../schemas/refund.schema'
import { formatVnd } from '../utils/refund.utils'

interface RefundSummaryProps {
  refund: Pick<
    RefundListItem,
    'refundCode' | 'customerName' | 'requestedAmount' | 'netCredit' | 'channel'
  >
  showAmounts?: boolean
}

export function RefundSummary({ refund, showAmounts }: RefundSummaryProps) {
  return (
    <dl className='grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm'>
      <dt className='text-muted-foreground'>Mã hoàn</dt>
      <dd className='font-medium'>{refund.refundCode}</dd>
      {refund.customerName && (
        <>
          <dt className='text-muted-foreground'>Khách hàng</dt>
          <dd>{refund.customerName}</dd>
        </>
      )}
      <dt className='text-muted-foreground'>Số tiền hoàn</dt>
      <dd className='tabular-nums'>{formatVnd(refund.requestedAmount)}</dd>
      {showAmounts && (
        <>
          <dt className='text-muted-foreground'>Khách thực nhận</dt>
          <dd className='tabular-nums'>{formatVnd(refund.netCredit)}</dd>
          <dt className='text-muted-foreground'>Kênh hoàn</dt>
          <dd>{REFUND_CHANNEL_LABELS[refund.channel] ?? refund.channel}</dd>
        </>
      )}
    </dl>
  )
}
