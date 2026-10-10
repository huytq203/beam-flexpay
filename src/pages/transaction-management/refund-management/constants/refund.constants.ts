import {
  RefundChannel,
  RefundOriginalType,
  RefundSource,
  RefundStatus
} from '../schemas/refund.schema'

export type RefundTone = 'success' | 'warning' | 'danger' | 'info' | 'normal'

export const REFUND_STATUS_LABELS: Record<
  RefundStatus,
  { label: string; tone: RefundTone }
> = {
  PENDING_APPROVAL: { label: 'Chờ duyệt', tone: 'warning' },
  WAITING_FUNDS: { label: 'Chờ đủ số dư', tone: 'warning' },
  PROCESSING: { label: 'Đã duyệt, đang chuyển tiền', tone: 'info' },
  SUCCESS: { label: 'Hoàn thành', tone: 'success' },
  REJECTED: { label: 'Đã từ chối', tone: 'danger' }
}

export const REFUND_CHANNEL_LABELS: Record<RefundChannel, string> = {
  TO_WALLET: 'Về ví',
  TO_BANK: 'Về ngân hàng'
}

export const REFUND_SOURCE_LABELS: Record<RefundSource, string> = {
  ADMIN_PORTAL: 'Admin Portal',
  CLIENT_APP: 'Ứng dụng khách',
  API: 'API'
}

export const REFUND_TYPE_LABELS: Record<RefundOriginalType, string> = {
  CASH_IN: 'Nạp tiền',
  CASH_OUT: 'Rút tiền',
  P2P_TRANSFER: 'Chuyển tiền',
  MERCHANT_PAYMENT: 'Thanh toán merchant'
}

export const REFUND_DEBTOR_LABELS: Record<RefundOriginalType, string> = {
  MERCHANT_PAYMENT: 'Ví merchant bị trừ',
  P2P_TRANSFER: 'Ví người nhận bị trừ',
  CASH_OUT: 'Quỹ tạm giữ hệ thống bị trừ',
  CASH_IN: 'Ví khách bị trừ (rồi chi ngân hàng)'
}

export const REFUND_STATUS_OPTIONS = Object.values(RefundStatus).map(
  (value) => ({ value, label: REFUND_STATUS_LABELS[value].label })
)

export const REFUND_CHANNEL_OPTIONS = Object.values(RefundChannel).map(
  (value) => ({ value, label: REFUND_CHANNEL_LABELS[value] })
)

export const REFUND_SOURCE_OPTIONS = Object.values(RefundSource).map(
  (value) => ({ value, label: REFUND_SOURCE_LABELS[value] })
)

export const REFUND_FILTER_KEYS = [
  'status',
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
