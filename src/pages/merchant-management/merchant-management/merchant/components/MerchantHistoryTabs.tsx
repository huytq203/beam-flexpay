import { CardComponent, TabComponent } from '@components/index'
import {
  useGetMerchantAuditLogsQuery,
  useGetMerchantStatusHistoryQuery
} from '@services/apiMerchant'
import {
  createAuditLogColumns,
  createStatusHistoryColumns
} from '../columns/merchantHistory.columns'
import { useHistoryPaging } from '../hooks/useHistoryPaging'
import { MerchantHistoryTable } from './MerchantHistoryTable'

interface MerchantHistoryPanelProps {
  merchantId: string
}

function StatusHistoryPanel({ merchantId }: MerchantHistoryPanelProps) {
  const { page, size, changePage } = useHistoryPaging()
  const query = useGetMerchantStatusHistoryQuery({ id: merchantId, page, size })
  return (
    <MerchantHistoryTable
      label='Lịch sử trạng thái'
      rowKey='auditLogId'
      columns={createStatusHistoryColumns({ page, pageSize: size })}
      data={query.data}
      isFetching={query.isFetching}
      isError={query.isError}
      error={query.error}
      page={page}
      size={size}
      emptyText='Chưa có thay đổi trạng thái'
      onRefetch={() => void query.refetch()}
      onPageChange={changePage}
    />
  )
}

function AuditLogPanel({ merchantId }: MerchantHistoryPanelProps) {
  const { page, size, changePage } = useHistoryPaging()
  const query = useGetMerchantAuditLogsQuery({ id: merchantId, page, size })
  return (
    <MerchantHistoryTable
      label='Nhật ký'
      rowKey='id'
      columns={createAuditLogColumns({ page, pageSize: size })}
      data={query.data}
      isFetching={query.isFetching}
      isError={query.isError}
      error={query.error}
      page={page}
      size={size}
      emptyText='Chưa có nhật ký thao tác'
      onRefetch={() => void query.refetch()}
      onPageChange={changePage}
    />
  )
}

/** Hiển thị trong `<Can action='viewHistory'>` (EWALLET:AUDIT:VIEW). */
export function MerchantHistoryTabs({ merchantId }: MerchantHistoryPanelProps) {
  return (
    <CardComponent>
      <TabComponent
        items={[
          {
            key: 'status-history',
            label: 'Lịch sử trạng thái',
            children: <StatusHistoryPanel merchantId={merchantId} />
          },
          {
            key: 'audit-logs',
            label: 'Nhật ký',
            children: <AuditLogPanel merchantId={merchantId} />
          }
        ]}
      />
    </CardComponent>
  )
}
