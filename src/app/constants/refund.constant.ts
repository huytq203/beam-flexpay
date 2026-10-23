import type { StatusTone } from '@components/status-badge/StatusToneBadge'

/**
 * Từ điển hoàn tiền dùng chung cho màn Quản lý hoàn tiền và khối "Yêu cầu hoàn tiền"
 * ở chi tiết giao dịch: cả hai đọc cùng `refundType`/`displayStatus` do user-wallet suy ra.
 */

/** Suy ra từ loại giao dịch gốc, BE không lưu cột riêng. */
export const RefundType = {
  WITHDRAW_BANK: 'WITHDRAW_BANK',
  WITHDRAW_REVERSAL: 'WITHDRAW_REVERSAL',
  REFUND_EWALLET: 'REFUND_EWALLET'
} as const
export type RefundType = (typeof RefundType)[keyof typeof RefundType]

/**
 * Giống `status`, riêng bản ghi "Thất bại hoàn tiền" của lệnh nạp đã chi xong là
 * `FAILED_REFUND`. Chỉ dùng để hiển thị và lọc; logic nút vẫn theo `status`.
 */
export const RefundDisplayStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  WAITING_FUNDS: 'WAITING_FUNDS',
  PENDING_PAYOUT_APPROVAL: 'PENDING_PAYOUT_APPROVAL',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  REJECTED: 'REJECTED',
  FAILED_REFUND: 'FAILED_REFUND'
} as const
export type RefundDisplayStatus =
  (typeof RefundDisplayStatus)[keyof typeof RefundDisplayStatus]

// Đặt tên theo giao dịch gốc vì kênh (về ví/về ngân hàng) đã hiện riêng; SRS gọi
// WITHDRAW_REVERSAL là "Nạp hoàn ví"/"Nạp hoàn trả", chờ BA chốt tên chính thức.
export const REFUND_TYPE_LABELS: Record<RefundType, string> = {
  WITHDRAW_BANK: 'Hoàn nạp tiền',
  WITHDRAW_REVERSAL: 'Hoàn rút tiền',
  REFUND_EWALLET: 'Hoàn chuyển tiền / thanh toán'
}

const isRefundType = (value: string): value is RefundType =>
  value in REFUND_TYPE_LABELS

/** Nhãn loại hoàn; mã lạ hiện nguyên văn. */
export const getRefundTypeLabel = (value: string): string =>
  isRefundType(value) ? REFUND_TYPE_LABELS[value] : value

export const REFUND_DISPLAY_STATUS_LABELS: Record<
  RefundDisplayStatus,
  { label: string; tone: StatusTone }
> = {
  PENDING_APPROVAL: { label: 'Chờ duyệt', tone: 'warning' },
  WAITING_FUNDS: { label: 'Chờ đủ số dư', tone: 'warning' },
  PENDING_PAYOUT_APPROVAL: { label: 'Chờ duyệt chi', tone: 'warning' },
  PROCESSING: { label: 'Đang xử lý', tone: 'info' },
  SUCCESS: { label: 'Thành công', tone: 'success' },
  REJECTED: { label: 'Đã từ chối', tone: 'danger' },
  FAILED_REFUND: { label: 'Thất bại hoàn tiền', tone: 'danger' }
}

export const REFUND_TYPE_OPTIONS = Object.values(RefundType).map((value) => ({
  value,
  label: REFUND_TYPE_LABELS[value]
}))

export const REFUND_DISPLAY_STATUS_OPTIONS = Object.values(
  RefundDisplayStatus
).map((value) => ({ value, label: REFUND_DISPLAY_STATUS_LABELS[value].label }))
