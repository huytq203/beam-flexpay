import { Can } from '@/app/permissions'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { PlusOutlined } from '@components/icons'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import { createAssignmentColumns } from '../columns/merchantAssignment.columns'
import {
  ASSIGNMENT_LEVEL_HINTS,
  ASSIGNMENT_LEVEL_LABELS
} from '../constants/merchantAssignment.constants'
import { useAssignmentList } from '../hooks/useAssignmentList'
import type {
  AdminAssignment,
  AssignmentScope
} from '../types/merchantAssignment.types'

interface Props {
  scope?: AssignmentScope
  onAssign: (assigned: readonly AdminAssignment[]) => void
  onRemove: (assignment: AdminAssignment) => void
}

export function AssignmentListPanel({ scope, onAssign, onRemove }: Props) {
  const { query, rows } = useAssignmentList(scope)
  const columns = createAssignmentColumns({ onRemove })

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='assignment-list-title'>
        <header className='mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <div>
            <h1
              id='assignment-list-title'
              className='font-display text-base font-semibold text-foreground'
            >
              Gán Sales phụ trách
              {scope && ` · ${ASSIGNMENT_LEVEL_LABELS[scope.level]}`}
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              {scope ? scope.label : 'Chọn Merchant để xem người phụ trách'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {scope && !query.isLoading && !query.isError && (
              <span
                aria-live='polite'
                className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums'
              >
                {rows.length} người phụ trách
              </span>
            )}
            <Can
              screen='MERCHANT_ASSIGNMENT'
              action='create'
            >
              <ButtonComponent
                content='Gán Sales'
                htmlType='button'
                icon={<PlusOutlined aria-hidden />}
                disabled={!scope || query.isError}
                onClick={() => onAssign(rows)}
              />
            </Can>
          </div>
        </header>
        {scope && (
          <p className='mb-3 text-xs text-muted-foreground'>
            {ASSIGNMENT_LEVEL_HINTS[scope.level]}
          </p>
        )}
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
          >
            {getApiErrorDetail(
              query.error,
              'Không thể tải danh sách người phụ trách.'
            )}
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<AdminAssignment>
          columns={columns}
          dataSource={query.isError ? [] : [...rows]}
          loading={query.isFetching}
          locale={{
            emptyText: scope
              ? 'Chưa có Sales nào được gán phụ trách'
              : 'Chọn Merchant để xem danh sách'
          }}
          onRefresh={scope ? query.refetch : undefined}
          pagination={false}
          rowKey='adminUserId'
          scroll={{ x: 'max-content' }}
          size='small'
        />
      </section>
    </CardComponent>
  )
}
