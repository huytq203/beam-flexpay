import { CheckCircleOutlined, EyeOutlined } from '@components/icons'
import { Can } from '@/app/permissions'
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
  onResolve: (anomaly: MerchantPaymentAnomaly) => void
}

export const createPaymentAnomalyColumns = ({
  page,
  pageSize,
  onViewOrder,
  onResolve
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
    title: 'Merchant',
    width: 180,
    render: (_, row) => row.merchantName || '—'
  },
  {
    title: 'Sub-merchant',
    width: 180,
    render: (_, row) => row.subMerchantName || '—'
  },
  {
    title: 'Mã đơn hàng',
    width: 160,
    render: (_, row) => row.orderCode || '—'
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
    title: 'Người xử lý',
    width: 200,
    render: (_, row) =>
      row.resolvedBy ? (
        <div className='space-y-0.5 text-xs'>
          <div>{row.resolvedBy}</div>
          {row.resolvedAt && <div>{formatOrderDateTime(row.resolvedAt)}</div>}
        </div>
      ) : (
        '—'
      )
  },
  {
    title: 'Lý do xử lý',
    width: 240,
    render: (_, row) => row.resolutionReason || '—'
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
    width: 110,
    render: (_, row) => (
      <div className='flex gap-1'>
        <AccessActionButton
          label='Xem đơn liên quan'
          icon={<EyeOutlined aria-hidden />}
          onClick={() => onViewOrder(row.orderId)}
        />
        <Can
          screen='MERCHANT_ORDER'
          action='resolveAnomaly'
        >
          {row.status === 'OPEN' && (
            <AccessActionButton
              label='Đánh dấu đã xử lý'
              icon={<CheckCircleOutlined aria-hidden />}
              onClick={() => onResolve(row)}
            />
          )}
        </Can>
      </div>
    )
  }
]
