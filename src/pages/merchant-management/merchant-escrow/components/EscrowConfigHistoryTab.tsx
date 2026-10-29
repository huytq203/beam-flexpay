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
  { title: 'Người lập', dataIndex: 'authorId', width: 160 },
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
  )
}
