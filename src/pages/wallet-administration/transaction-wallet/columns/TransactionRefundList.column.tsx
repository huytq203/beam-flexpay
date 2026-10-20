import { RefundStatusBadge } from '@components/status-badge/RefundStatusBadge'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import {
  RefundDisplayStatus,
  getRefundTypeLabel
} from '@constants/refund.constant'
import type { RefundItemInfo } from '@/app/schemas/unified-refund.schema'
import { formatCurrency } from '@utils/formatNumber'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'

type RefundListColumns = NonNullable<
  TableComponentProps<RefundItemInfo>['columns']
>

const EMPTY = '--'

const formatDate = (value?: string | null): string =>
  formatUTCToLocalDateTime(value) || EMPTY

export const createTransactionRefundColumns = (
  currency = 'VND'
): RefundListColumns => {
  const formatMoney = (value: number): string =>
    formatCurrency(value, { symbol: currency, position: 'after' })

  return [
    {
      title: '#',
      key: 'index',
      width: 56,
      align: 'center',
      render: (_value, _record, index) => (
        <span className='tabular-nums'>{index + 1}</span>
      )
    },
    {
      title: 'Mã hoàn',
      key: 'refundCode',
      render: (_value, record) => (
        <div className='flex flex-col'>
          <span className='font-medium'>{record.refundCode}</span>
          <span className='text-xs text-muted-foreground'>
            {getRefundTypeLabel(record.refundType)}
          </span>
        </div>
      )
    },
    {
      title: 'Số tiền hoàn',
      key: 'requestedAmount',
      align: 'right',
      render: (_value, record) => (
        <span className='whitespace-nowrap tabular-nums'>
          {formatMoney(record.requestedAmount)}
        </span>
      )
    },
    {
      title: 'Thực nhận',
      key: 'netCredit',
      align: 'right',
      // Yêu cầu bị từ chối không chuyển tiền; BE trả 0 nên hiện "--" để khỏi đọc nhầm là nhận 0 đ.
      render: (_value, record) => (
        <span className='font-medium whitespace-nowrap tabular-nums'>
          {record.status === RefundDisplayStatus.REJECTED
            ? EMPTY
            : formatMoney(record.netCredit)}
        </span>
      )
    },
    {
      title: 'Trạng thái',
      key: 'displayStatus',
      align: 'center',
      render: (_value, record) => (
        <div className='flex flex-col items-center gap-1'>
          <RefundStatusBadge status={record.displayStatus || record.status} />
          {record.rejectedReason && (
            <span className='max-w-56 text-xs whitespace-normal text-muted-foreground'>
              {record.rejectedReason}
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Tạo lúc',
      key: 'createdAt',
      render: (_value, record) => (
        <div className='flex flex-col whitespace-nowrap'>
          <span>{formatDate(record.createdAt)}</span>
          <span className='text-xs text-muted-foreground'>
            {record.createdBy || EMPTY}
          </span>
        </div>
      )
    },
    {
      title: 'Duyệt lúc',
      key: 'approvedAt',
      render: (_value, record) => (
        <span className='whitespace-nowrap'>
          {formatDate(record.approvedAt)}
        </span>
      )
    }
  ]
}
