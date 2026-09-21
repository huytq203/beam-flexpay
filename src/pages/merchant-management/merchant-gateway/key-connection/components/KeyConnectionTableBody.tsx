import { MerchantGatewayTableState } from '../../shared/MerchantGatewayTableState'
import type { ListState } from '../../shared/merchantGateway.types'
import type { KeyConnectionColumns } from '../columns/keyConnection.columns'
import type { KeyConnectionRow } from '../types/keyConnection.type'

interface KeyConnectionTableBodyProps {
  columns: KeyConnectionColumns
  rows: KeyConnectionRow[]
  state: ListState
  page: number
  pageSize: number
  total: number
  filtered: boolean
  onPageChange: (page: number) => void
  onRetry: () => void
}

export function KeyConnectionTableBody({
  columns,
  rows,
  state,
  page,
  pageSize,
  total,
  filtered,
  onPageChange,
  onRetry
}: KeyConnectionTableBodyProps) {
  if (state === 'loading') {
    return <MerchantGatewayTableState columns={columns} rowKey='id' rows={[]} state='loading' />
  }

  if (state === 'error') {
    return <MerchantGatewayTableState columns={columns} rowKey='id' rows={[]} state='error' onRetry={onRetry} />
  }

  if (state === 'empty') {
    return <MerchantGatewayTableState columns={columns} emptyKind={filtered ? 'filtered' : 'initial'} rowKey='id' rows={[]} state='empty' onRetry={onRetry} />
  }

  return (
    <MerchantGatewayTableState
      columns={columns}
      onRefresh={onRetry}
      pagination={{ current: page, pageSize, total, showSizeChanger: false, onChange: onPageChange }}
      rowKey='id'
      rows={rows}
      state='success'
    />
  )
}
