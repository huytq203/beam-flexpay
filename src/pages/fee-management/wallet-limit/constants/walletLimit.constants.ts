import {
  WalletLimitPaymentMethod,
  WalletLimitScope,
  WalletLimitStatus,
  WalletLimitTransactionType
} from '@type/walletLimit.type'

export const SCOPE_LABELS: Record<WalletLimitScope, string> = {
  SYSTEM: 'Hệ thống',
  GROUP: 'Nhóm',
  WALLET: 'Ví'
}

export const TRANSACTION_TYPE_LABELS: Record<
  WalletLimitTransactionType,
  string
> = {
  ALL: 'Tất cả',
  DEPOSIT: 'Nạp tiền',
  WITHDRAWAL: 'Rút tiền',
  TRANSFER: 'Chuyển tiền'
}

export const STATUS_LABELS: Record<WalletLimitStatus, string> = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Khóa'
}

export const PAYMENT_METHOD_LABELS: Record<WalletLimitPaymentMethod, string> = {
  LINKED_ACCOUNT: 'Liên kết ngân hàng',
  WALLET_BALANCE: 'Số dư ví'
}

/** Ngân hàng BE hiện hỗ trợ cho dòng override. */
export const BANK_OPTIONS = [
  { label: 'VCB', value: 'VCB' },
  { label: 'VPB', value: 'VPB' }
]

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

export const SCOPE_OPTIONS = toOptions(SCOPE_LABELS)
export const TRANSACTION_TYPE_OPTIONS = toOptions(TRANSACTION_TYPE_LABELS)
/** Dòng override không có loại "Tất cả". */
export const OVERRIDE_TRANSACTION_TYPE_OPTIONS =
  TRANSACTION_TYPE_OPTIONS.filter(
    (option) => option.value !== WalletLimitTransactionType.ALL
  )
export const STATUS_OPTIONS = toOptions(STATUS_LABELS)
export const PAYMENT_METHOD_OPTIONS = toOptions(PAYMENT_METHOD_LABELS)

/** Nhãn BE dùng trong thông báo lỗi và màn Lịch sử; FE giữ đúng nhãn đó. */
export const LIMIT_FIELD_LABELS = {
  minPerTransaction: 'Tối thiểu/GD',
  maxPerTransaction: 'Tối đa/GD',
  dailyMaximum: 'Hạn mức ngày',
  normalMonthlyMaximum: 'Hạn mức tháng (thường)',
  specialMonthlyMaximum: 'Hạn mức tháng (đặc biệt)',
  walletBalanceMaximum: 'Số dư tối đa của ví',
  outflowDailyMaximum: 'Tổng chi trong ngày',
  outflowMonthlyMaximum: 'Tổng chi trong tháng',
  outboundMaxTimesPerDay: 'Số lần chi trong ngày',
  approvalThreshold: 'Ngưỡng duyệt lệnh rút'
} as const

export type LimitFieldKey = keyof typeof LIMIT_FIELD_LABELS

/** Hai khối ô số của form: hạn mức giao dịch, rồi giới hạn chi và sức chứa. */
export const TRANSACTION_LIMIT_KEYS = [
  'minPerTransaction',
  'maxPerTransaction',
  'dailyMaximum',
  'normalMonthlyMaximum',
  'specialMonthlyMaximum'
] as const satisfies readonly LimitFieldKey[]

export const OUTFLOW_LIMIT_KEYS = [
  'walletBalanceMaximum',
  'outflowDailyMaximum',
  'outflowMonthlyMaximum',
  'outboundMaxTimesPerDay',
  'approvalThreshold'
] as const satisfies readonly LimitFieldKey[]

export const REQUIRED_LIMIT_KEYS: readonly LimitFieldKey[] = [
  'minPerTransaction',
  'maxPerTransaction'
]

export const WALLET_LIMIT_DEFAULT_PAGE_SIZE = 20
export const WALLET_LIMIT_HISTORY_PAGE_SIZE = 10
