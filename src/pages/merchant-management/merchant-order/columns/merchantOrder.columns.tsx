import { Can } from '@/app/permissions'
import {
  CheckCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  StopOutlined,
  ArrowsCounterClockwiseIcon
} from '@components/icons'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { AccessActionButton } from '../../merchant-access/components/AccessActionButton'
import { OrderStatusTag } from '../components/OrderStatusTag'
import { BANK_LABELS } from '../constants/merchantOrder.constants'
import type {
  MerchantOrder,
  OrderActionKind
} from '../types/merchantOrder.types'
import {
  canCancelOrder,
  canConfirmOrder,
  canRefreshOrderQr,
  canRetryCredit,
  formatOrderDateTime,
  formatOrderMoney
} from '../utils/merchantOrder.utils'

interface Options {
  page: number
  pageSize: number
  onView: (order: MerchantOrder) => void
  onAction: (kind: OrderActionKind, order: MerchantOrder) => void
}

export const createMerchantOrderColumns = ({
  page,
  pageSize,
  onView,
  onAction
}: Options): NonNullable<TableComponentProps<MerchantOrder>['columns']> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _order, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Mã đơn',
    width: 200,
    render: (_, order) => (
      <button
        className='text-left font-medium text-secondary-foreground hover:underline'
        type='button'
        onClick={() => onView(order)}
      >
        {order.orderCode}
      </button>
    )
  },
  {
    title: 'Merchant',
    width: 220,
    render: (_, order) => (
      <div className='min-w-0'>
        <div className='truncate text-sm text-foreground'>
          {order.merchantName || '—'}
        </div>
        <div className='text-xs text-muted-foreground'>
          {order.merchantCode}
        </div>
      </div>
    )
  },
  {
    title: 'Số tiền',
    align: 'right',
    width: 140,
    render: (_, order) => formatOrderMoney(order.amount)
  },
  {
    title: 'Phí',
    align: 'right',
    width: 120,
    render: (_, order) => (
      <span title={order.status === 'SUCCESS' ? undefined : 'Phí ước tính'}>
        {formatOrderMoney(order.feeAmount)}
        {order.status === 'SUCCESS' ? '' : '*'}
      </span>
    )
  },
  {
    title: 'Ngân hàng',
    width: 120,
    render: (_, order) => BANK_LABELS[order.bankCode] ?? order.bankCode
  },
  {
    title: 'Trạng thái',
    width: 190,
    render: (_, order) => (
      <div>
        <OrderStatusTag status={order.status} />
        {order.creditFailureReason && (
          <div
            className='mt-1 max-w-48 truncate text-xs text-danger-strong'
            title={order.creditFailureReason}
          >
            {order.creditFailureReason}
          </div>
        )}
      </div>
    )
  },
  {
    title: 'Hạn thanh toán',
    width: 170,
    render: (_, order) => formatOrderDateTime(order.expiredAt)
  },
  {
    title: 'Tạo lúc',
    width: 170,
    render: (_, order) => formatOrderDateTime(order.createdAt)
  },
  {
    title: 'Thao tác',
    fixed: 'right',
    width: 190,
    render: (_, order) => (
      <div className='flex items-center gap-1'>
        <AccessActionButton
          label={`Xem đơn ${order.orderCode}`}
          icon={<EyeOutlined aria-hidden />}
          onClick={() => onView(order)}
        />
        <Can
          screen='MERCHANT_ORDER'
          action='confirm'
        >
          {canConfirmOrder(order) && (
            <AccessActionButton
              label={`Xác nhận thanh toán đơn ${order.orderCode}`}
              icon={<CheckCircleOutlined aria-hidden />}
              onClick={() => onAction('confirm', order)}
            />
          )}
        </Can>
        <Can
          screen='MERCHANT_ORDER'
          action='retryCredit'
        >
          {canRetryCredit(order) && (
            <AccessActionButton
              label={`Ghi có lại đơn ${order.orderCode}`}
              icon={<DollarOutlined aria-hidden />}
              onClick={() => onAction('retry', order)}
            />
          )}
        </Can>
        <Can
          screen='MERCHANT_ORDER'
          action='refreshQr'
        >
          {canRefreshOrderQr(order) && (
            <AccessActionButton
              label={`Làm mới QR đơn ${order.orderCode}`}
              icon={
                <ArrowsCounterClockwiseIcon
                  aria-hidden
                  size={16}
                />
              }
              onClick={() => onAction('refresh', order)}
            />
          )}
        </Can>
        <Can
          screen='MERCHANT_ORDER'
          action='cancel'
        >
          {canCancelOrder(order) && (
            <AccessActionButton
              danger
              label={`Hủy đơn ${order.orderCode}`}
              icon={<StopOutlined aria-hidden />}
              onClick={() => onAction('cancel', order)}
            />
          )}
        </Can>
      </div>
    )
  }
]
