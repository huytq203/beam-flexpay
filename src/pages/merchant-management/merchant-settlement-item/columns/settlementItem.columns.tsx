import { Can } from '@/app/permissions'
import { EyeOutlined } from '@components/icons'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { AccessActionButton } from '../../merchant-access/components/AccessActionButton'
import {
  formatOrderDateTime,
  formatOrderMoney
} from '../../merchant-order/utils/merchantOrder.utils'
import { TrancheCell } from '../components/TrancheCell'
import type { SettlementItemRow } from '../types/settlementItem.types'

interface Options {
  page: number
  pageSize: number
  onView: (item: SettlementItemRow) => void
}

const money = (value: number) => (
  <span className='tabular-nums'>{formatOrderMoney(value)}</span>
)

export const createSettlementItemColumns = ({
  page,
  pageSize,
  onView
}: Options): NonNullable<TableComponentProps<SettlementItemRow>['columns']> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _item, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Mã đơn',
    width: 190,
    render: (_, item) => (
      <button
        className='text-left font-medium text-secondary-foreground hover:underline'
        type='button'
        onClick={() => onView(item)}
      >
        {item.orderCode}
      </button>
    )
  },
  {
    title: 'Thanh toán lúc',
    width: 170,
    render: (_, item) => formatOrderDateTime(item.paidAt)
  },
  {
    title: 'Khách trả',
    align: 'right',
    width: 140,
    render: (_, item) => money(item.grossAmount)
  },
  {
    title: 'Phí',
    align: 'right',
    width: 120,
    render: (_, item) => money(item.feeAmount)
  },
  {
    title: 'Doanh thu ghi nhận',
    align: 'right',
    width: 160,
    render: (_, item) => money(item.recognisedAmount)
  },
  {
    title: 'Đợt 1',
    align: 'right',
    width: 180,
    render: (_, item) => (
      <TrancheCell
        amount={item.firstTrancheAmount}
        status={item.firstTrancheStatus}
        withdrawalId={item.firstTrancheWithdrawalId}
      />
    )
  },
  {
    title: 'Đợt tạm giữ',
    align: 'right',
    width: 180,
    render: (_, item) => (
      <TrancheCell
        amount={item.heldAmount}
        status={item.holdTrancheStatus}
        withdrawalId={item.holdTrancheWithdrawalId}
      />
    )
  },
  {
    title: 'Hết hạn giữ',
    width: 170,
    // Luôn có giá trị, kể cả khi không có đợt tạm giữ.
    render: (_, item) =>
      item.heldAmount > 0 ? formatOrderDateTime(item.holdReleaseAt) : '—'
  },
  {
    title: 'Thao tác',
    fixed: 'right',
    width: 80,
    render: (_, item) => (
      <Can
        screen='MERCHANT_SETTLEMENT_ITEM'
        action='viewDetail'
      >
        <AccessActionButton
          label={`Xem mục quyết toán ${item.orderCode}`}
          icon={<EyeOutlined aria-hidden />}
          onClick={() => onView(item)}
        />
      </Can>
    )
  }
]
