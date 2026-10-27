import { Table } from '@components/index'
import { createSettlementItemBySubColumns } from '../columns/settlementItemBySub.columns'
import type { SettlementItemSubTotals } from '../types/settlementItem.types'

interface Props {
  rows: readonly SettlementItemSubTotals[]
}

/** Chia tổng theo Sub; BE chỉ điền khi tra theo Merchant (không chọn Sub). */
export function SettlementItemBySub({ rows }: Props) {
  if (rows.length === 0) return null
  return (
    <section
      aria-label='Tổng theo Sub-merchant'
      className='mb-3'
    >
      <h2 className='mb-2 text-sm font-semibold text-foreground'>
        Tổng theo Sub-merchant
      </h2>
      <Table<SettlementItemSubTotals>
        columns={createSettlementItemBySubColumns()}
        dataSource={[...rows]}
        pagination={false}
        rowKey='subMerchantId'
        scroll={{ x: 'max-content' }}
        size='small'
      />
    </section>
  )
}
