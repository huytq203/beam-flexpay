import { CardComponent, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import { systemLedgerColumns } from '@pages/transaction-management/system-ledger/columns/SystemLedger.column'
import { LedgerLoadError } from '@pages/transaction-management/system-ledger/components/LedgerLoadError'
import type { LedgerRow } from '@pages/transaction-management/system-ledger/utils/groupLedgerByJournal'
import useSystemAccountLedger from '../hooks/useSystemAccountLedger'

// Đang xem đúng một tài khoản nên cột tài khoản và vai trò không thêm thông tin.
const columns = systemLedgerColumns.filter(
  (column) => column.key !== 'account' && column.key !== 'role'
)

interface Props {
  accountId?: string
}

const SystemAccountLedger = ({ accountId }: Props) => {
  const {
    dataSource,
    totalElements,
    page,
    size,
    handleChangePage,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useSystemAccountLedger(accountId)

  return (
    <CardComponent
      content={
        <section aria-labelledby='system-account-ledger-title'>
          <h2
            id='system-account-ledger-title'
            className='mb-3 mt-0 font-display text-lg font-semibold'
          >
            Lịch sử cộng / trừ
          </h2>
          {isError && (
            <LedgerLoadError
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          )}
          {isLoading ? (
            <SkeletonTable
              columns={columns.length}
              rows={size}
              noContainer
            />
          ) : (
            <Table<LedgerRow>
              size='small'
              columns={columns}
              dataSource={dataSource}
              loading={isFetching}
              onRefresh={refetch}
              rowKey='id'
              locale={{
                emptyText: isError
                  ? 'Chưa có dữ liệu do tải sổ cái thất bại'
                  : 'Tài khoản chưa có biến động số dư'
              }}
              pagination={{
                current: page,
                pageSize: size,
                total: totalElements,
                onChange: handleChangePage
              }}
            />
          )}
        </section>
      }
    />
  )
}

export default SystemAccountLedger
