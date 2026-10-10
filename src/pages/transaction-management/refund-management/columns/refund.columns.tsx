import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { CellLines } from '../components/CellLines'
import { RefundActions } from '../components/RefundActions'
import { RefundStatusBadge } from '../components/RefundStatusBadge'
import {
  REFUND_CHANNEL_LABELS,
  REFUND_SOURCE_LABELS
} from '../constants/refund.constants'
import type { RefundListItem } from '../schemas/refund.schema'
import {
  formatDateTime,
  formatVnd,
  getRefundActions,
  type RefundActionContext
} from '../utils/refund.utils'

export interface RefundColumnOptions {
  page: number
  pageSize: number
  context: RefundActionContext
  payoutRefreshingId?: string
  onView: (refund: RefundListItem) => void
  onApprove: (refund: RefundListItem) => void
  onReject: (refund: RefundListItem) => void
  onSettle: (refund: RefundListItem) => void
  onPayoutRefresh: (refund: RefundListItem) => void
}

type RefundColumns = NonNullable<TableComponentProps<RefundListItem>['columns']>

export const getRefundRowNumber = (
  page: number,
  pageSize: number,
  index: number
): number => (page - 1) * pageSize + index + 1

export const createRefundColumns = (
  options: RefundColumnOptions
): RefundColumns => {
  const { page, pageSize, context, payoutRefreshingId } = options
  return [
    {
      title: '#',
      key: 'index',
      width: 56,
      align: 'right',
      render: (_value, _record, index) => (
        <span className='tabular-nums'>
          {getRefundRowNumber(page, pageSize, index)}
        </span>
      )
    },
    {
      title: 'Mã hoàn',
      key: 'refundCode',
      render: (_value, record) => (
        <CellLines
          primary={record.refundCode}
          secondary={[
            record.originalTransactionCode &&
              `GD gốc ${record.originalTransactionCode}`,
            record.payoutCode && `Lệnh chi ${record.payoutCode}`
          ]}
        />
      )
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_value, record) => (
        <CellLines
          primary={record.customerName || '-'}
          secondary={[record.customerPhone]}
        />
      )
    },
    {
      title: 'Số tiền hoàn',
      key: 'requestedAmount',
      align: 'right',
      render: (_value, record) => (
        <CellLines
          numeric
          align='right'
          primary={formatVnd(record.requestedAmount)}
          secondary={[
            record.originalAmount != null &&
              `GD gốc ${formatVnd(record.originalAmount)}`
          ]}
        />
      )
    },
    {
      title: 'Khách thực nhận',
      key: 'netCredit',
      align: 'right',
      render: (_value, record) => (
        <span className='font-medium tabular-nums'>
          {formatVnd(record.netCredit)}
        </span>
      )
    },
    {
      title: 'Kênh và nguồn',
      key: 'channelSource',
      render: (_value, record) => (
        <CellLines
          primary={REFUND_CHANNEL_LABELS[record.channel] ?? record.channel}
          secondary={[
            REFUND_SOURCE_LABELS[record.createdSource] ?? record.createdSource
          ]}
        />
      )
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      render: (_value, record) => (
        <span>{formatDateTime(record.createdAt)}</span>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 220,
      render: (_value, record) => <RefundStatusBadge status={record.status} />
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      align: 'right',
      // Duyệt/Từ chối chỉ ở drawer: danh sách BE chưa trả `createdBy` nên dòng không so được maker/checker.
      render: (_value, record) => (
        <RefundActions
          refund={record}
          flags={getRefundActions(record, context)}
          variant='icon'
          onView={options.onView}
          onApprove={options.onApprove}
          onReject={options.onReject}
          onSettle={options.onSettle}
          onPayoutRefresh={options.onPayoutRefresh}
          isPayoutRefreshing={payoutRefreshingId === record.id}
        />
      )
    }
  ]
}
