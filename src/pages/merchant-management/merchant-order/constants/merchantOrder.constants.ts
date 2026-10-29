import type {
  AnomalyFilters,
  MerchantOrderStatus,
  OrderBankCode,
  OrderFilters,
  OrderPaymentMethod,
  PaymentAnomalyReason,
  PaymentAnomalyStatus
} from '../types/merchantOrder.types'

export const ORDER_STATUS_LABELS: Record<MerchantOrderStatus, string> = {
  ACTIVE: 'Chờ thanh toán',
  PAYMENT_CONFIRMED: 'Đã nhận tiền',
  CREDIT_POSTING: 'Đang xử lý',
  // Alias chuyển tiếp, gỡ sau 1 sprint: BE đã đổi sang CREDIT_POSTING.
  CREDIT_RECONCILIATION_REQUIRED: 'Đang xử lý',
  SUCCESS: 'Thành công',
  FAILED: 'Phát hành thất bại',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy',
  PENDING: 'Chờ xử lý (dữ liệu cũ)',
  CREDIT_PENDING: 'Chờ ghi có (dữ liệu cũ)'
}

export const ORDER_STATUS_DESCRIPTIONS: Record<MerchantOrderStatus, string> = {
  ACTIVE: 'Đã phát hành QR/VA, đang chờ khách thanh toán trong hạn.',
  PAYMENT_CONFIRMED:
    'Đã ghi nhận tiền ngân hàng báo có, đang bắt đầu ghi có cho merchant.',
  CREDIT_POSTING:
    'Đã giữ chỗ bút toán và gắn báo giá phí, đang ghi có vào ví; nếu kẹt có thể Ghi có lại.',
  CREDIT_RECONCILIATION_REQUIRED:
    'Đang ghi có vào ví; nếu kẹt có thể Ghi có lại (giá trị cũ, BE nay trả Đang xử lý).',
  SUCCESS: 'Đã ghi có cho merchant (trạng thái cuối).',
  FAILED: 'Ngân hàng từ chối phát hành QR/VA khi tạo đơn (trạng thái cuối).',
  EXPIRED: 'Quá hạn thanh toán, job nền đã đóng đơn (trạng thái cuối).',
  CANCELLED: 'Đã hủy khi còn chờ thanh toán (trạng thái cuối).',
  PENDING: 'Giá trị cũ của cột, không còn luồng nào đặt.',
  CREDIT_PENDING: 'Coi như đang ghi có, không còn luồng nào đặt.'
}

export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'default'

export const ORDER_STATUS_COLORS: Record<MerchantOrderStatus, StatusColor> = {
  ACTIVE: 'info',
  PAYMENT_CONFIRMED: 'warning',
  CREDIT_POSTING: 'warning',
  // Alias chuyển tiếp: cùng tông cảnh báo với CREDIT_POSTING.
  CREDIT_RECONCILIATION_REQUIRED: 'warning',
  SUCCESS: 'success',
  FAILED: 'danger',
  EXPIRED: 'default',
  CANCELLED: 'default',
  PENDING: 'default',
  CREDIT_PENDING: 'warning'
}

/**
 * Trạng thái dùng để lọc; PENDING/CREDIT_PENDING không còn luồng nào đặt, còn alias
 * CREDIT_RECONCILIATION_REQUIRED đã bị gỡ khỏi bộ lọc (gỡ hẳn sau 1 sprint).
 */
export const ORDER_STATUS_FILTER_VALUES: readonly MerchantOrderStatus[] = [
  'ACTIVE',
  'PAYMENT_CONFIRMED',
  'CREDIT_POSTING',
  'SUCCESS',
  'FAILED',
  'EXPIRED',
  'CANCELLED'
]

/** Các trạng thái cho phép `retry-credit` (kể cả SUCCESS idempotent, không mời gọi). */
export const RETRY_CREDIT_STATUSES: readonly MerchantOrderStatus[] = [
  'PAYMENT_CONFIRMED',
  'CREDIT_POSTING',
  'CREDIT_PENDING',
  // Alias chuyển tiếp, gỡ sau 1 sprint: đơn cũ có thể còn giá trị này.
  'CREDIT_RECONCILIATION_REQUIRED'
]

export const BANK_LABELS: Record<OrderBankCode, string> = {
  VPB: 'VPBank',
  VCB: 'Vietcombank'
}

export const PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  QR: 'Mã QR',
  VIRTUAL_ACCOUNT: 'Tài khoản định danh (VA)',
  DOMESTIC_CARD: 'Thẻ nội địa',
  INTERNATIONAL_CARD: 'Thẻ quốc tế',
  LINKED_WALLET: 'Ví liên kết'
}

export const ANOMALY_REASON_LABELS: Record<PaymentAnomalyReason, string> = {
  ORDER_NOT_PAYABLE: 'Đơn không còn chờ thanh toán',
  ORDER_EXPIRED: 'Đơn đã quá hạn thanh toán',
  AMOUNT_MISMATCH: 'Sai số tiền',
  DUPLICATE_PAYMENT: 'Thanh toán trùng'
}

export const ANOMALY_STATUS_LABELS: Record<PaymentAnomalyStatus, string> = {
  OPEN: 'Chưa xử lý',
  RESOLVED: 'Đã xử lý'
}

export const ORDER_FILTER_KEYS = [
  'merchantCode',
  'merchantId',
  'orderCode',
  'status'
] as const
export type OrderFilterKey = (typeof ORDER_FILTER_KEYS)[number]

export const ANOMALY_FILTER_KEYS = ['status'] as const
export type AnomalyFilterKey = (typeof ANOMALY_FILTER_KEYS)[number]

export const EMPTY_ORDER_FILTERS: OrderFilters = {
  merchantCode: '',
  orderCode: ''
}
export const EMPTY_ANOMALY_FILTERS: AnomalyFilters = {}

export const ORDER_PAGE_SIZE_OPTIONS = [20, 50, 100]
export const ORDER_DEFAULT_PAGE_SIZE = 20
export const ORDER_CODE_MAX = 100
export const ORDER_TEXT_MAX = 255
