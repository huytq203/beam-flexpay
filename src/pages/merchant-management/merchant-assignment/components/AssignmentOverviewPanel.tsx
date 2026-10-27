import { getApiErrorDetail } from '@/app/utils/api-error'
import type { AssignmentListItem } from '@/app/services/merchantAssignmentApi'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import { createAssignmentOverviewColumns } from '../columns/assignmentOverview.columns'
import { ASSIGNMENT_PAGE_SIZES } from '../constants/merchantAssignment.constants'
import { useAssignmentOverview } from '../hooks/useAssignmentOverview'
import { AssignmentOverviewFilters } from './AssignmentOverviewFilters'

/** Chưa chọn Merchant: xem mọi dòng gán Master + Sub thay vì bảng trống. */
export function AssignmentOverviewPanel() {
  const { query, draft, setDraft, page, pageSize, apply, reset, paginate } =
    useAssignmentOverview()
  const columns = createAssignmentOverviewColumns({ page, pageSize })

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='assignment-overview-title'>
        <header className='mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3'>
          <div>
            <h1
              id='assignment-overview-title'
              className='font-display text-base font-semibold text-foreground'
            >
              Tất cả phân công Sales
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              Chọn Merchant ở trên để gán hoặc gỡ người phụ trách.
            </p>
          </div>
          {query.data && (
            <span
              aria-live='polite'
              className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums'
            >
              {query.data.totalElements} dòng gán
            </span>
          )}
        </header>
        <div className='mb-4'>
          <AssignmentOverviewFilters
            draft={draft}
            onChange={setDraft}
            onApply={apply}
            onReset={reset}
          />
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
          >
            {getApiErrorDetail(
              query.error,
              'Không thể tải danh sách phân công.'
            )}
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<AssignmentListItem>
          columns={columns}
          dataSource={query.isError ? [] : [...(query.data?.content ?? [])]}
          loading={query.isFetching}
          locale={{ emptyText: 'Chưa có dòng gán nào khớp bộ lọc' }}
          onRefresh={query.refetch}
          pagination={{
            current: page,
            pageSize,
            total: query.data?.totalElements ?? 0,
            showSizeChanger: true,
            pageSizeOptions: ASSIGNMENT_PAGE_SIZES,
            onChange: paginate
          }}
          rowKey={(row) =>
            `${row.level}:${row.subMerchantId ?? row.merchantId}:${row.adminUserId}`
          }
          scroll={{ x: 'max-content' }}
          size='small'
        />
      </section>
    </CardComponent>
  )
}
