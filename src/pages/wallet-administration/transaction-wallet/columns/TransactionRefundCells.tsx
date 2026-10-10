import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import StatusBadge from '@components/status-badge/StatusBadge'
import { cn } from '@utils/cn'
import { formatNumber } from '@utils/index'
import { CONFIG_STATUS } from '../constants/Transaction.constant'
import {
  formatRefundedAmount,
  getDisplayStatus,
  getPendingRefundAmount,
  readRefundFields
} from '../dto/transactionRefund.dto'
import { TRANSACTION_FREEZE_STATUS } from './transactionBadgeConfig'

/** `null` hiện "-" vì BE không tra được, khác với `0` ("chưa hoàn đồng nào"). */
export function RefundedAmountCell({
  record
}: {
  record: UnifiedContentJournal
}) {
  const fields = readRefundFields(record)
  const pending = getPendingRefundAmount(fields)
  return (
    <div className='text-right tabular-nums'>
      <p className='font-medium'>{formatRefundedAmount(record, fields)}</p>
      {pending !== null && (
        <p className='amount-caution text-[12px]'>
          Đang chờ hoàn {formatNumber(pending)} {record.currency}
        </p>
      )}
    </div>
  )
}

/** Nhãn theo `displayStatus`; hiệu ứng nhấp nháy dựa trên `status` sổ cái. */
export function TransactionStatusCell({
  record
}: {
  record: UnifiedContentJournal
}) {
  return (
    <div className='flex flex-wrap items-center justify-center gap-1'>
      <StatusBadge
        className={cn(record.status === 'PENDING' ? 'animate-pulse-soft' : '')}
        status={getDisplayStatus(record)}
        config={CONFIG_STATUS}
      />
      {record.frozen && (
        <StatusBadge
          status='FROZEN'
          config={TRANSACTION_FREEZE_STATUS}
        />
      )}
    </div>
  )
}
