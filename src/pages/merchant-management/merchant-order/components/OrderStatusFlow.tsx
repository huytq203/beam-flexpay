import {
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_LABELS
} from '../constants/merchantOrder.constants'
import type { MerchantOrderStatus } from '../types/merchantOrder.types'
import { OrderStatusTag } from './OrderStatusTag'

const MAIN_FLOW: readonly MerchantOrderStatus[] = [
  'ACTIVE',
  'PAYMENT_CONFIRMED',
  'CREDIT_POSTING',
  'SUCCESS'
]
const SIDE_STATES: readonly { status: MerchantOrderStatus; note: string }[] = [
  {
    status: 'CREDIT_RECONCILIATION_REQUIRED',
    note: 'Từ Đã nhận tiền/Đang ghi có khi lỗi hoặc chưa rõ kết quả; ghi có lại để về Thành công.'
  },
  { status: 'CANCELLED', note: 'Từ Chờ thanh toán khi hủy đơn.' },
  { status: 'EXPIRED', note: 'Từ Chờ thanh toán khi quá hạn (job nền).' },
  { status: 'FAILED', note: 'Ngân hàng từ chối phát hành QR/VA lúc tạo đơn.' }
]

interface Props {
  current?: MerchantOrderStatus
}

/** Máy trạng thái đơn bằng tiếng Việt; trạng thái hiện tại được nhấn mạnh. */
export function OrderStatusFlow({ current }: Props) {
  return (
    <div className='w-80 max-w-full space-y-3 text-sm'>
      <ol className='flex flex-wrap items-center gap-1'>
        {MAIN_FLOW.map((status, index) => (
          <li
            key={status}
            className='flex items-center gap-1'
            aria-current={status === current ? 'step' : undefined}
          >
            {index > 0 && <span aria-hidden>→</span>}
            <span
              className={
                status === current
                  ? 'rounded-md ring-2 ring-primary'
                  : undefined
              }
            >
              <OrderStatusTag status={status} />
            </span>
          </li>
        ))}
      </ol>
      <ul className='space-y-2'>
        {SIDE_STATES.map(({ status, note }) => (
          <li
            key={status}
            className={status === current ? 'font-medium' : undefined}
          >
            <OrderStatusTag status={status} />
            <span className='ml-2 text-xs text-muted-foreground'>{note}</span>
          </li>
        ))}
      </ul>
      {current && (
        <p className='border-t border-border pt-2 text-xs text-muted-foreground'>
          Hiện tại: <strong>{ORDER_STATUS_LABELS[current] ?? current}</strong>.{' '}
          {ORDER_STATUS_DESCRIPTIONS[current]}
        </p>
      )}
    </div>
  )
}
