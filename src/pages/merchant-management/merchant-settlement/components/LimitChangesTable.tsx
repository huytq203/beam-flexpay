import { ButtonComponent, Table } from '@components/index'
import {
  createLimitChangeColumns,
  type LimitColumnOptions
} from '../columns/limitChange.columns'
import type { LimitChangeDto } from '../types/withdrawalLimit.types'

interface LimitChangesTableProps extends LimitColumnOptions {
  title: string
  emptyText: string
  rows: LimitChangeDto[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function LimitChangesTable({
  title,
  emptyText,
  rows,
  isLoading,
  isError,
  onRetry,
  ...actions
}: LimitChangesTableProps) {
  return (
    <section aria-label={title}>
      <h2 className='mb-3 text-sm font-semibold'>{title}</h2>
      {isError ? (
        <div role='alert'>
          <p>Không tải được dữ liệu.</p>
          <ButtonComponent
            content='Thử lại'
            htmlType='button'
            onClick={onRetry}
          />
        </div>
      ) : (
        <Table
          columns={createLimitChangeColumns(actions)}
          dataSource={rows}
          loading={isLoading}
          locale={{ emptyText }}
          pagination={false}
          rowKey='id'
          size='small'
        />
      )}
    </section>
  )
}
