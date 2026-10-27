import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { formatOrderMoney } from '../../merchant-order/utils/merchantOrder.utils'
import type { SettlementItemSubTotals } from '../types/settlementItem.types'

const money = (value: number) => (
  <span className='tabular-nums'>{formatOrderMoney(value)}</span>
)

export const createSettlementItemBySubColumns = (): NonNullable<
  TableComponentProps<SettlementItemSubTotals>['columns']
> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => index + 1
  },
  {
    title: 'Sub-merchant',
    width: 220,
    render: (_, row) => (
      <div className='min-w-0'>
        <div>{row.subMerchantName || row.subMerchantId}</div>
        {row.subMerchantCode && (
          <div className='text-xs text-muted-foreground'>
            {row.subMerchantCode}
          </div>
        )}
      </div>
    )
  },
  {
    title: 'Số mục',
    align: 'right',
    width: 100,
    render: (_, row) => <span className='tabular-nums'>{row.count}</span>
  },
  {
    title: 'Khách trả',
    align: 'right',
    width: 140,
    render: (_, row) => money(row.grossAmount)
  },
  {
    title: 'Phí',
    align: 'right',
    width: 120,
    render: (_, row) => money(row.feeAmount)
  },
  {
    title: 'Doanh thu ghi nhận',
    align: 'right',
    width: 160,
    render: (_, row) => money(row.recognisedAmount)
  },
  {
    title: 'Đợt 1',
    align: 'right',
    width: 140,
    render: (_, row) => money(row.firstTrancheAmount)
  },
  {
    title: 'Đợt tạm giữ',
    align: 'right',
    width: 140,
    render: (_, row) => money(row.heldAmount)
  }
]
