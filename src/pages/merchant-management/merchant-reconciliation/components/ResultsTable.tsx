import { useState } from 'react'
import { ButtonComponent, Table } from '@components/index'
import { createResultColumns } from '../columns/result.columns'
import { PAGE_SIZE } from '../constants/reconciliation.constants'
import type { ReconciliationResult } from '../types/reconciliation.types'
import { EquationTable } from './EquationTable'

interface ResultsTableProps {
  rows: ReconciliationResult[]
  isLoading: boolean
  isError: boolean
  errorText: string
  onRetry: () => void
}

/** BE trả tối đa 200 bản ghi, không phân trang nên phân trang tại FE. */
export function ResultsTable({
  rows,
  isLoading,
  isError,
  errorText,
  onRetry
}: ResultsTableProps) {
  const [page, setPage] = useState(1)
  if (isError)
    return (
      <div role='alert'>
        <p>{errorText}</p>
        <ButtonComponent
          content='Thử lại'
          htmlType='button'
          onClick={onRetry}
        />
      </div>
    )
  return (
    <Table
      columns={createResultColumns({ page, pageSize: PAGE_SIZE })}
      dataSource={rows}
      expandable={{
        rowExpandable: (row) => row.equations.length > 0,
        expandedRowRender: (row) => <EquationTable equations={row.equations} />
      }}
      loading={isLoading}
      locale={{ emptyText: 'Chưa có kết quả đối soát nào' }}
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
  )
}
