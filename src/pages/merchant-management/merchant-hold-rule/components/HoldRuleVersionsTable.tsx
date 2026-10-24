import { useState } from 'react'
import { ButtonComponent, Table } from '@components/index'
import {
  createHoldRuleColumns,
  type HoldRuleColumnOptions
} from '../columns/holdRule.columns'
import type { HoldRuleChange } from '../types/holdRule.types'

const PAGE_SIZE = 10

interface HoldRuleVersionsTableProps
  extends Pick<
    HoldRuleColumnOptions,
    'showTarget' | 'showDecision' | 'onApprove' | 'onReject'
  > {
  title: string
  description?: string
  emptyText: string
  rows: HoldRuleChange[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

/** Danh sách phiên bản (không phân trang phía BE) nên phân trang tại FE. */
export function HoldRuleVersionsTable({
  title,
  description,
  emptyText,
  rows,
  isLoading,
  isError,
  onRetry,
  ...columnOptions
}: HoldRuleVersionsTableProps) {
  const [page, setPage] = useState(1)
  return (
    <section aria-label={title}>
      <h2 className='mb-1 text-sm font-semibold'>{title}</h2>
      {description && (
        <p className='mb-3 text-xs text-muted-foreground'>{description}</p>
      )}
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
          columns={createHoldRuleColumns({
            ...columnOptions,
            page,
            pageSize: PAGE_SIZE
          })}
          dataSource={rows}
          loading={isLoading}
          locale={{ emptyText }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: rows.length,
            showSizeChanger: false,
            hideOnSinglePage: true,
            onChange: setPage
          }}
          rowKey='id'
          scroll={{ x: 'max-content' }}
          size='small'
        />
      )}
    </section>
  )
}
