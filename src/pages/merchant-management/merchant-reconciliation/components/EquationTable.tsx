import { Table } from '@components/index'
import { createEquationColumns } from '../columns/equation.columns'
import type { ReconciliationEquation } from '../types/reconciliation.types'

/** Chín phương trình của một lần chạy; 7-9 đếm số vi phạm nên không gắn đơn vị tiền. */
export function EquationTable({
  equations
}: {
  equations: ReconciliationEquation[]
}) {
  return (
    <Table
      columns={createEquationColumns()}
      dataSource={equations}
      locale={{ emptyText: 'Lần chạy này không có phương trình nào' }}
      pagination={false}
      rowKey='no'
      scroll={{ x: 'max-content' }}
      size='small'
    />
  )
}
