import {
  RefundChannel,
  RefundOriginalType,
  RefundSource
} from '../schemas/refund.schema'

export const REFUND_CHANNEL_LABELS: Record<RefundChannel, string> = {
  TO_WALLET: 'Về ví',
  TO_BANK: 'Về ngân hàng'
}

export const REFUND_SOURCE_LABELS: Record<RefundSource, string> = {
  ADMIN_PORTAL: 'Admin Portal',
  CLIENT_APP: 'Ứng dụng khách',
  API: 'API'
}

export const REFUND_ORIGINAL_TYPE_LABELS: Record<RefundOriginalType, string> = {
  CASH_IN: 'Nạp tiền',
  CASH_OUT: 'Rút tiền',
  P2P_TRANSFER: 'Chuyển tiền'
}

export const REFUND_DEBTOR_LABELS: Record<RefundOriginalType, string> = {
  P2P_TRANSFER: 'Tiền trừ vào ví người nhận',
  CASH_OUT: 'Quỹ tạm giữ hệ thống bị trừ',
  CASH_IN: 'Tổng tiền trừ ví'
}

export const REFUND_CREDIT_LABELS: Partial<Record<RefundOriginalType, string>> =
  {
    P2P_TRANSFER: 'Tiền cộng vào ví người chuyển',
    CASH_IN: 'Tổng tiền cộng ngân hàng'
  }

export const REFUND_CHANNEL_OPTIONS = Object.values(RefundChannel).map(
  (value) => ({ value, label: REFUND_CHANNEL_LABELS[value] })
)

export const REFUND_SOURCE_OPTIONS = Object.values(RefundSource).map(
  (value) => ({ value, label: REFUND_SOURCE_LABELS[value] })
)

/** `status` giữ lại cho link cũ; chip trạng thái nay lọc theo `displayStatus`. */
export const REFUND_FILTER_KEYS = [
  'status',
  'displayStatus',
  'refundType',
  'keyword',
  'channel',
  'createdSource',
  'createdFrom',
  'createdTo'
] as const
export type RefundFilterKey = (typeof REFUND_FILTER_KEYS)[number]

export const REFUND_PAGE_SIZE_OPTIONS = [10, 20, 50]
export const REFUND_DEFAULT_PAGE_SIZE = 20

export const WALLET_FAILURE_HINT =
  'Thao tác trên ví thất bại, vui lòng thử lại hoặc liên hệ bộ phận kỹ thuật'
export const SETTLE_AGAIN_HINT =
  'Đã duyệt nhưng chưa chuyển được tiền, cần quyết toán lại'
export const WAITING_FUNDS_HINT = 'Đang chờ đủ số dư'
