import { CardComponent, ButtonComponent, Table } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { REFUND_PAGE_SIZE_OPTIONS } from '../constants/refund.constants'
import type { useRefundList } from '../hooks/useRefundList'
import type { RefundListItem } from '../schemas/refund.schema'
import { getRefundErrorText } from '../utils/refund.utils'
import { RefundNote } from './RefundNote'

interface RefundListCardProps {
  list: ReturnType<typeof useRefundList>
  columns: NonNullable<TableComponentProps<RefundListItem>['columns']>
  isBusy: boolean
}

export function RefundListCard({ list, columns, isBusy }: RefundListCardProps) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='refund-list-title'>
        <header className='mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3'>
          <h2
            id='refund-list-title'
            className='font-display text-base font-semibold'
          >
            Danh sách yêu cầu
          </h2>
          <span
            aria-live='polite'
            className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums'
          >
            {list.isError ? 0 : list.total} bản ghi
          </span>
        </header>
        {list.isError && (
          <RefundNote
            tone='danger'
            className='mb-3'
          >
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <span>
                Không tải được danh sách hoàn tiền.{' '}
                {getRefundErrorText(list.error)}
              </span>
              <ButtonComponent
                size='small'
                type='default'
                content='Thử lại'
                onClick={() => void list.refetch()}
              />
            </div>
          </RefundNote>
        )}
        <Table<RefundListItem>
          columns={columns}
          dataSource={list.isError ? [] : list.rows}
          rowKey='id'
          size='small'
          loading={list.isLoading || list.isFetching || isBusy}
          onRefresh={list.refetch}
          locale={{
            emptyText: 'Chưa có yêu cầu hoàn tiền nào khớp điều kiện'
          }}
          pagination={{
            current: list.page,
            pageSize: list.pageSize,
            total: list.total,
            pageSizeOptions: REFUND_PAGE_SIZE_OPTIONS,
            onChange: (nextPage, nextSize) => {
              if (nextSize !== list.pageSize) list.setPageSize(nextSize)
              else list.setPage(nextPage)
            }
          }}
        />
      </section>
    </CardComponent>
  )
}
