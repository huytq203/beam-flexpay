import { useGetEscrowConfigHistoryQuery } from '@/app/services/merchantEscrowApi'
import { Table } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { formatCurrency } from '@utils/formatNumber'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  ESCROW_CONFIG_APPROVAL_LABEL,
  ESCROW_CONFIG_SOURCE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowConfig } from '../types/merchantEscrow.types'
import { EscrowLoadError } from './EscrowLoadError'

/** authorId cố định BE dùng cho thao tác do hệ thống tạo (job soát xét định kỳ). */
const SYSTEM_AUTHOR_ID = '00000000-0000-0000-0000-000000000001'

const columns: NonNullable<TableComponentProps<EscrowConfig>['columns']> = [
  { title: 'Phiên bản', dataIndex: 'version', width: 90, align: 'right' },
  {
    title: 'Trạng thái duyệt',
    width: 140,
    render: (_, r) =>
      ESCROW_CONFIG_APPROVAL_LABEL[r.approvalStatus] ?? r.approvalStatus
  },
  {
    title: 'Nguồn',
    width: 130,
    render: (_, r) => ESCROW_CONFIG_SOURCE_LABEL[r.source] ?? r.source
  },
  {
    title: 'Mức yêu cầu',
    align: 'right',
    width: 150,
    render: (_, r) => (
      <span className='tabular-nums'>{formatCurrency(r.requiredAmount)}</span>
    )
  },
  {
    title: 'Người lập',
    width: 160,
    render: (_, r) =>
      r.authorId === SYSTEM_AUTHOR_ID ? 'Hệ thống' : r.authorId
  },
  { title: 'Người duyệt', dataIndex: 'approverId', width: 160 },
  {
    title: 'Ghi chú',
    width: 240,
    render: (_, r) => r.decisionNote ?? r.reason
  },
  {
    title: 'Thời điểm lập',
    width: 170,
    render: (_, r) => formatUTCToLocalDateTime(r.createdAt)
  }
]

/** Mọi phiên bản cấu hình của Master. */
export function EscrowConfigHistoryTab({ masterId }: { masterId: string }) {
  const query = useGetEscrowConfigHistoryQuery(masterId)
  return (
    <div className='flex flex-col gap-3'>
      {query.isError && (
        <EscrowLoadError
          error={query.error}
          fallback='Không tải được lịch sử cấu hình.'
          onRetry={() => void query.refetch()}
        />
      )}
      <Table<EscrowConfig>
        columns={columns}
        dataSource={[...(query.data ?? [])]}
        loading={query.isFetching}
        onRefresh={query.refetch}
        pagination={false}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
      />
    </div>
  )
}
