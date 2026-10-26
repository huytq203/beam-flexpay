import type { ColumnsType } from 'antd/es/table'
import StatusBadge from '@components/status-badge/StatusBadge'
import { TagComponent } from '@components/index'
import type {
  MerchantAuditLog,
  MerchantStatus,
  MerchantStatusHistoryItem
} from '@type/merchant'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { AuditDataDetails } from '../components/AuditDataDetails'
import { STATUS_CONFIG } from '../constants/Merchant.constant'
import {
  AUDIT_ACTION_LABEL,
  REJECTION_REASON_LABEL
} from '../constants/merchantDetail.constants'

interface HistoryColumnOptions {
  page: number
  pageSize: number
}

const indexColumn = <T extends object>({
  page,
  pageSize
}: HistoryColumnOptions): ColumnsType<T>[number] => ({
  title: '#',
  align: 'center',
  width: 64,
  render: (_value, _row, index) => (page - 1) * pageSize + index + 1
})

const statusCell = (status: MerchantStatus | null) =>
  status ? (
    <StatusBadge
      status={status}
      config={STATUS_CONFIG}
    />
  ) : (
    '—'
  )

const actorCell = (row: {
  actorUsername: string | null
  actorId: string | null
  actorType: string | null
}) => (
  <div className='flex flex-col'>
    <span>{row.actorUsername || row.actorId || '—'}</span>
    {row.actorType && (
      <span className='text-xs text-muted-foreground'>{row.actorType}</span>
    )}
  </div>
)

const timeColumn = <
  T extends { occurredAt: string }
>(): ColumnsType<T>[number] => ({
  title: 'Thời gian',
  dataIndex: 'occurredAt',
  width: 170,
  render: (value: string) => formatUTCToLocalDateTime(value) || '—'
})

export const createStatusHistoryColumns = (
  options: HistoryColumnOptions
): ColumnsType<MerchantStatusHistoryItem> => [
  indexColumn(options),
  {
    title: 'Trạng thái',
    width: 260,
    render: (_, row) => (
      <div className='flex flex-wrap items-center gap-1'>
        {statusCell(row.fromStatus)}
        <span aria-hidden>→</span>
        <span className='sr-only'>sang</span>
        {statusCell(row.toStatus)}
      </div>
    )
  },
  {
    title: 'Lý do',
    render: (_, row) => (
      <div className='flex flex-col gap-1'>
        {row.rejectedReasonCode && (
          <TagComponent color='error'>
            {REJECTION_REASON_LABEL[row.rejectedReasonCode] ??
              row.rejectedReasonCode}
          </TagComponent>
        )}
        <span className='whitespace-pre-line'>
          {row.rejectedReasonDetail || row.reason || '—'}
        </span>
      </div>
    )
  },
  { title: 'Người thực hiện', width: 180, render: (_, row) => actorCell(row) },
  timeColumn<MerchantStatusHistoryItem>()
]

export const createAuditLogColumns = (
  options: HistoryColumnOptions
): ColumnsType<MerchantAuditLog> => [
  indexColumn(options),
  {
    title: 'Hành động',
    width: 160,
    render: (_, row) => (
      <div className='flex flex-col'>
        <span className='font-medium'>
          {AUDIT_ACTION_LABEL[row.action] ?? row.action}
        </span>
        <span className='text-xs text-muted-foreground'>{row.entityName}</span>
      </div>
    )
  },
  { title: 'Người thực hiện', width: 180, render: (_, row) => actorCell(row) },
  {
    title: 'Nguồn / IP',
    width: 160,
    render: (_, row) => (
      <div className='flex flex-col'>
        <span>{row.source || '—'}</span>
        <span className='text-xs text-muted-foreground'>
          {row.ipAddress || '—'}
        </span>
      </div>
    )
  },
  {
    title: 'Lý do',
    dataIndex: 'reason',
    width: 200,
    render: (value: string | null) => value || '—'
  },
  {
    title: 'Dữ liệu thay đổi',
    width: 280,
    render: (_, row) => (
      <AuditDataDetails
        oldData={row.oldData}
        newData={row.newData}
      />
    )
  },
  timeColumn<MerchantAuditLog>()
]
