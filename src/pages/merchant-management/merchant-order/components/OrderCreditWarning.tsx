import { ORDER_STATUS_LABELS } from '../constants/merchantOrder.constants'
import type { MerchantOrder } from '../types/merchantOrder.types'

/**
 * `confirm`/`retry-credit` trả HTTP 200 kể cả khi ghi có lỗi: phải đọc trạng
 * thái và lý do trong thân phản hồi thay vì coi là thành công.
 */
export function OrderCreditWarning({ order }: { order: MerchantOrder }) {
  const needsRetry = order.status === 'CREDIT_RECONCILIATION_REQUIRED'
  return (
    <div
      role='alert'
      className='rounded-lg border border-warning-strong/40 bg-warning/10 p-3 text-warning-strong'
    >
      <p className='font-medium'>
        Chưa ghi có xong: đơn đang ở trạng thái{' '}
        {ORDER_STATUS_LABELS[order.status] ?? order.status}.
      </p>
      {order.creditFailureReason && <p>{order.creditFailureReason}</p>}
      <p className='mt-1'>
        {needsRetry
          ? 'Đóng hộp thoại, kiểm tra lại đơn rồi dùng Ghi có lại. Nếu vẫn lỗi, không gọi lặp liên tục mà báo vận hành.'
          : 'Tải lại danh sách để xem trạng thái mới nhất; nếu đơn vẫn kẹt, dùng Ghi có lại.'}
      </p>
    </div>
  )
}
