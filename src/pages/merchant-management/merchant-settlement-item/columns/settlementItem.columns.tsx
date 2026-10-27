import { Can } from '@/app/permissions'
import { EyeOutlined } from '@components/icons'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { AccessActionButton } from '../../merchant-access/components/AccessActionButton'
import {
  formatOrderDateTime,
  formatOrderMoney
} from '../../merchant-order/utils/merchantOrder.utils'
import { TrancheCell } from '../components/TrancheCell'
import type {
  SettlementItemRow,
  SettlementItemSort,
  SettlementSortBy
} from '../types/settlementItem.types'

interface Options {
  page: number
  pageSize: number
  /** Sắp xếp đang áp; chưa chọn thì BE xếp theo thời điểm thanh toán giảm dần. */
  sort: SettlementItemSort
  onView: (item: SettlementItemRow) => void
}

const sortOrderOf = (sort: SettlementItemSort, field: SettlementSortBy) => {
  const active = sort.sortBy ?? 'paidAt'
  if (active !== field) return null
  return (sort.sortDirection ?? 'DESC') === 'ASC' ? 'ascend' : 'descend'
}

const money = (value: number) => (
  <span className='tabular-nums'>{formatOrderMoney(value)}</span>
)

export const createSettlementItemColumns = ({
  page,
  pageSize,
  sort,
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
    title: 'Merchant',
    width: 180,
    render: (_, item) => item.merchantName || item.merchantId
  },
  {
    title: 'Sub-merchant',
    width: 200,
    render: (_, item) => (
      <div className='min-w-0'>
        <div>{item.subMerchantName || item.subMerchantId}</div>
        {item.subMerchantCode && (
          <div className='text-xs text-muted-foreground'>
            {item.subMerchantCode}
          </div>
        )}
      </div>
    )
  },
  {
    title: 'Thanh toán lúc',
    key: 'paidAt',
    sorter: true,
    sortOrder: sortOrderOf(sort, 'paidAt'),
    width: 170,
    render: (_, item) => formatOrderDateTime(item.paidAt)
  },
  {
    title: 'Khách trả',
    key: 'customerPaid',
    sorter: true,
    sortOrder: sortOrderOf(sort, 'customerPaid'),
    align: 'right',
    width: 140,
    render: (_, item) => money(item.grossAmount)
  },
  {
    title: 'Phí',
    key: 'fee',
    sorter: true,
    sortOrder: sortOrderOf(sort, 'fee'),
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
