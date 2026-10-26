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

/** Nhãn hiển thị trên form/chi tiết. Thông báo lỗi do BE trả về vẫn dùng nhãn SRS cũ của BE. */
export const LIMIT_FIELD_LABELS = {
  minPerTransaction: 'Số tiền tối thiểu mỗi giao dịch',
  maxPerTransaction: 'Số tiền tối đa mỗi giao dịch',
  dailyMaximum: 'Hạn mức trong ngày (theo loại giao dịch)',
  normalMonthlyMaximum: 'Hạn mức tháng – dịch vụ thường',
  specialMonthlyMaximum: 'Hạn mức tháng – dịch vụ đặc biệt',
  walletBalanceMaximum: 'Số dư tối đa được giữ trong ví',
  outflowDailyMaximum: 'Tổng tiền chi ra trong ngày (mọi loại GD)',
  outflowMonthlyMaximum: 'Tổng tiền chi ra trong tháng (mọi loại GD)',
  outboundMaxTimesPerDay: 'Số lệnh chi tối đa trong ngày',
  approvalThreshold: 'Ngưỡng duyệt lệnh rút'
} as const

export type LimitFieldKey = keyof typeof LIMIT_FIELD_LABELS

/**
 * Ở dòng loại "Tất cả", `normalMonthlyMaximum` là trần nhóm Dịch vụ thông
 * thường: chỉ cộng Chuyển tiền + Thanh toán thường, không chặn nạp/rút.
 */
export const REGULAR_GROUP_MONTHLY_LABEL =
  'Hạn mức tháng – dịch vụ thông thường'
export const REGULAR_GROUP_MONTHLY_HINT =
  'Chỉ tính Chuyển tiền + Thanh toán, không chặn Nạp/Rút.'

export const getLimitLabel = (
  key: LimitFieldKey,
  transactionType: string | undefined
): string =>
  key === 'normalMonthlyMaximum' &&
  transactionType === WalletLimitTransactionType.ALL
    ? REGULAR_GROUP_MONTHLY_LABEL
    : LIMIT_FIELD_LABELS[key]

export const getLimitHint = (
  key: LimitFieldKey,
  transactionType: string | undefined
): string | undefined =>
  key === 'normalMonthlyMaximum' &&
  transactionType === WalletLimitTransactionType.ALL
    ? REGULAR_GROUP_MONTHLY_HINT
    : undefined

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
