import { Table } from '@components/index'
import {
  formatOrderDateTime,
  formatOrderMoney
} from '../../merchant-order/utils/merchantOrder.utils'
import { SETTLEMENT_LINE_KIND_LABELS } from '../constants/settlementItem.constants'
import type { SettlementItemLine } from '../types/settlementItem.types'
import { DetailSection } from './SettlementItemDetailSections'
import { SettlementStatusTag } from './SettlementStatusTag'

/** Đợt 1, đợt giữ rồi các dòng hoàn; `amount` của REFUND là số âm. */
export function SettlementItemLines({
  lines
}: {
  lines: readonly SettlementItemLine[]
}) {
  return (
    <DetailSection title='Các dòng quyết toán'>
      <Table<SettlementItemLine>
        dataSource={[...lines]}
        locale={{ emptyText: 'Chưa có dòng quyết toán' }}
        pagination={false}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
        columns={[
          {
            title: '#',
            align: 'center',
            width: 48,
            render: (_value, _line, index) => index + 1
          },
          {
            title: 'Loại',
            render: (_, line) =>
              SETTLEMENT_LINE_KIND_LABELS[line.kind] ?? line.kind
          },
          {
            title: 'Số tiền',
            align: 'right',
            render: (_, line) => (
              <span className='tabular-nums'>
                {formatOrderMoney(line.amount)}
              </span>
            )
          },
          {
            title: 'Trạng thái',
            render: (_, line) => <SettlementStatusTag status={line.status} />
          },
          {
            title: 'Lệnh rút',
            render: (_, line) => line.withdrawalRequestId ?? '—'
          },
          {
            title: 'Cập nhật',
            render: (_, line) => formatOrderDateTime(line.updatedAt)
          }
        ]}
      />
    </DetailSection>
  )
}
