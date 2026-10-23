import { EyeOutlined } from '@components/icons'
import { CopyableText, TagComponent } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { AccessActionButton } from '../../merchant-access/components/AccessActionButton'
import { OrderStatusTag } from '../components/OrderStatusTag'
import {
  ANOMALY_REASON_LABELS,
  ANOMALY_STATUS_LABELS,
  BANK_LABELS
} from '../constants/merchantOrder.constants'
import type { MerchantPaymentAnomaly } from '../types/merchantOrder.types'
import {
  formatOrderDateTime,
  formatOrderMoney
} from '../utils/merchantOrder.utils'

interface Options {
  page: number
  pageSize: number
  onViewOrder: (orderId: string) => void
}

export const createPaymentAnomalyColumns = ({
  page,
  pageSize,
  onViewOrder
}: Options): NonNullable<
  TableComponentProps<MerchantPaymentAnomaly>['columns']
> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Ghi nhận lúc',
    width: 170,
    render: (_, row) => formatOrderDateTime(row.createdAt)
  },
  {
    title: 'Ngân hàng',
    width: 120,
    render: (_, row) => BANK_LABELS[row.bankCode] ?? row.bankCode
  },
  {
    title: 'Lý do',
    width: 220,
    render: (_, row) => ANOMALY_REASON_LABELS[row.reason] ?? row.reason
  },
  {
    title: 'Tiền ngân hàng báo có',
    align: 'right',
    width: 170,
    render: (_, row) => formatOrderMoney(row.amount)
  },
  {
    title: 'Số tiền của đơn',
    align: 'right',
    width: 150,
    render: (_, row) => formatOrderMoney(row.expectedAmount)
  },
  {
    title: 'Trạng thái đơn lúc ghi nhận',
    width: 200,
    render: (_, row) => <OrderStatusTag status={row.orderStatus} />
  },
  {
    title: 'Tham chiếu VCB',
    width: 200,
    render: (_, row) => (
      <div className='space-y-0.5 text-xs'>
        {row.paymentRef && <div>Ref: {row.paymentRef}</div>}
        {row.billNumber && <div>Hóa đơn: {row.billNumber}</div>}
        {!row.paymentRef && !row.billNumber && '—'}
      </div>
    )
  },
  {
    title: 'Xử lý',
    width: 130,
    render: (_, row) => (
      <TagComponent color={row.status === 'OPEN' ? 'warning' : 'success'}>
        {ANOMALY_STATUS_LABELS[row.status] ?? row.status}
      </TagComponent>
    )
  },
  {
    title: 'Mã đơn (ID)',
    width: 190,
    render: (_, row) => (
      <CopyableText
        value={row.orderId}
        className='text-xs font-normal'
      />
    )
  },
  {
    title: 'Thao tác',
    fixed: 'right',
    width: 90,
    render: (_, row) => (
      <AccessActionButton
        label='Xem đơn liên quan'
        icon={<EyeOutlined aria-hidden />}
        onClick={() => onViewOrder(row.orderId)}
      />
    )
  }
]
