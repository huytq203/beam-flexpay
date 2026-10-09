import type { WalletLimitHistoryEntry } from '@type/walletLimit.type'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import { createWalletLimitHistoryColumns } from '../columns/walletLimitHistory.columns'
import type { useWalletLimitHistory } from '../hooks/useWalletLimitHistory'

type HistoryState = ReturnType<typeof useWalletLimitHistory>

interface WalletLimitHistoryListProps {
  history: HistoryState
}

export function WalletLimitHistoryList({
  history
}: WalletLimitHistoryListProps) {
  const { query, rows, total, page, size, setPage } = history

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div className='mb-3'>
        <h1 className='text-xl font-semibold'>Lịch sử cập nhật</h1>
        <p className='mt-1 max-w-prose text-xs text-muted-foreground'>
          Mỗi lần lưu là một dòng. Chỉ liệt kê trường thực sự thay đổi, nhãn do
          hệ thống trả sẵn.
        </p>
      </div>
      {query.isError ? (
        <div
          role='alert'
          className='flex flex-wrap items-center justify-between gap-2 text-sm text-danger-strong'
        >
          Không thể tải lịch sử cập nhật.
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      ) : (
        <Table<WalletLimitHistoryEntry>
          rowKey={(row) => `${row.occurredAt}-${row.action}`}
          size='small'
          loading={query.isFetching}
          dataSource={rows}
          locale={{
            emptyText: (
              <p className='py-6 text-xs text-muted-foreground'>
                Cấu hình này chưa có lịch sử cập nhật.
              </p>
            )
          }}
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: false,
            onChange: setPage
          }}
          columns={createWalletLimitHistoryColumns({ page, size })}
        />
      )}
    </CardComponent>
  )
}
