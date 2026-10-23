import type {
  SettlementItemFilters,
  SettlementLineKind,
  SettlementLineStatus
} from '../types/settlementItem.types'

export const SETTLEMENT_FILTER_KEYS = [
  'subMerchantId',
  'paidFrom',
  'paidTo'
] as const
export type SettlementFilterKey = (typeof SETTLEMENT_FILTER_KEYS)[number]

export const EMPTY_SETTLEMENT_FILTERS: SettlementItemFilters = {}

export const SETTLEMENT_PAGE_SIZE_OPTIONS = [20, 50, 100]
export const SETTLEMENT_DEFAULT_PAGE_SIZE = 20

export const SETTLEMENT_STATUS_LABELS: Record<SettlementLineStatus, string> = {
  PENDING_SETTLEMENT: 'Chờ quyết toán',
  HELD: 'Đang giữ',
  READY: 'Sẵn sàng rút',
  IN_WITHDRAWAL: 'Trong lệnh rút',
  PAID: 'Đã chi',
  CANCELLED: 'Đã hủy'
}

export const SETTLEMENT_STATUS_DESCRIPTIONS: Record<
  SettlementLineStatus,
  string
> = {
  PENDING_SETTLEMENT: 'Chưa đến hạn T+N nên chưa rút được.',
  HELD: 'Đang tạm giữ, chờ hết hạn giữ.',
  READY: 'Có thể đưa vào lệnh rút.',
  IN_WITHDRAWAL: 'Đã nằm trong một lệnh rút đang xử lý.',
  PAID: 'Lệnh rút đã chi xong (trạng thái cuối).',
  CANCELLED: 'Đã hủy (trạng thái cuối).'
}

export const SETTLEMENT_STATUS_COLORS: Record<
  SettlementLineStatus,
  'success' | 'warning' | 'danger' | 'info' | 'default'
> = {
  PENDING_SETTLEMENT: 'warning',
  HELD: 'warning',
  READY: 'success',
  IN_WITHDRAWAL: 'info',
  PAID: 'default',
  CANCELLED: 'danger'
}

export const SETTLEMENT_LINE_KIND_LABELS: Record<SettlementLineKind, string> = {
  FIRST_TRANCHE: 'Đợt 1',
  HOLD_TRANCHE: 'Đợt tạm giữ',
  REFUND: 'Hoàn doanh thu',
  FEE_REFUND: 'Hoàn phí'
}

export const SETTLEMENT_FILTER_MESSAGES = {
  sub: 'Vui lòng chọn Sub-merchant.',
  dates: 'Vui lòng chọn đủ khoảng ngày thanh toán (từ ngày, đến ngày).',
  range: 'Ngày kết thúc không được trước ngày bắt đầu.'
} as const

export const SETTLEMENT_INTEGRITY_CHECKS = [
  {
    key: 'grossEqualsFeePlusRecognised',
    label: 'Tổng tiền khách trả = Phí + Doanh thu ghi nhận'
  },
  {
    key: 'recognisedEqualsTranches',
    label: 'Doanh thu ghi nhận = Đợt 1 + Đợt tạm giữ'
  },
  {
    key: 'singleItemForPayment',
    label: 'Đơn chỉ có đúng một mục quyết toán'
  }
] as const
