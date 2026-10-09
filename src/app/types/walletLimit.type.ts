/** Kiểu dữ liệu API hạn mức ví (flexpay.user-wallet, `/wallet-limit-*`). */

export const WalletLimitScope = {
  SYSTEM: 'SYSTEM',
  GROUP: 'GROUP',
  WALLET: 'WALLET'
} as const
export type WalletLimitScope =
  (typeof WalletLimitScope)[keyof typeof WalletLimitScope]

export const WalletLimitTransactionType = {
  ALL: 'ALL',
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER: 'TRANSFER'
} as const
export type WalletLimitTransactionType =
  (typeof WalletLimitTransactionType)[keyof typeof WalletLimitTransactionType]

export const WalletLimitStatus = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED'
} as const
export type WalletLimitStatus =
  (typeof WalletLimitStatus)[keyof typeof WalletLimitStatus]

export const WalletLimitPaymentMethod = {
  LINKED_ACCOUNT: 'LINKED_ACCOUNT',
  WALLET_BALANCE: 'WALLET_BALANCE'
} as const
export type WalletLimitPaymentMethod =
  (typeof WalletLimitPaymentMethod)[keyof typeof WalletLimitPaymentMethod]

export interface WalletLimitBankOverride {
  id?: string
  policyId?: string
  transactionType: WalletLimitTransactionType
  bankCode: string | null
  paymentMethod: WalletLimitPaymentMethod | null
  minPerTransaction: number
  maxPerTransaction: number
  dailyMaximum: number
  normalMonthlyMaximum: number | null
  specialMonthlyMaximum: number | null
  createdAt?: string
}

export interface WalletLimitPolicy {
  id: string
  scopeType: WalletLimitScope
  targetId: string | null
  /** SĐT của ví (WALLET), tên nhóm (GROUP), `null` với SYSTEM. */
  targetDisplay: string | null
  walletType: string
  transactionType: WalletLimitTransactionType
  minPerTransaction: number
  maxPerTransaction: number
  dailyMaximum: number | null
  normalMonthlyMaximum: number | null
  specialMonthlyMaximum: number | null
  walletBalanceMaximum: number | null
  outflowDailyMaximum: number | null
  outflowMonthlyMaximum: number | null
  outboundMaxTimesPerDay: number | null
  approvalThreshold: number | null
  status: WalletLimitStatus
  bankOverrides: WalletLimitBankOverride[]
  createdAt: string
  createdByUsername: string | null
  updatedAt: string | null
  updatedByUsername: string | null
  rowVersion: number
}

/** Trang Spring: `number` bắt đầu từ 0, tham số request `page` bắt đầu từ 1. */
export interface WalletLimitPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface WalletLimitListParams {
  scopeType?: WalletLimitScope
  targetKeyword?: string
  transactionType?: WalletLimitTransactionType
  bankCode?: string
  paymentMethod?: WalletLimitPaymentMethod
  status?: WalletLimitStatus
  /** ISO-8601 instant. */
  createdFrom?: string
  createdTo?: string
  page: number
  size: number
}

export interface WalletLimitHistoryChange {
  field: string
  label: string
  oldValue: string | number | null
  newValue: string | number | null
}

export interface WalletLimitHistoryEntry {
  occurredAt: string
  actorUsername: string | null
  ipAddress: string | null
  action: 'INSERT' | 'UPDATE'
  changes: WalletLimitHistoryChange[]
}

export interface WalletLimitSpecialMonth {
  id: string
  /** `yyyy-MM-dd`, luôn là ngày 1 của tháng. */
  monthStart: string
  name: string
  createdAt: string
  createdByUsername: string | null
  updatedAt: string | null
  updatedByUsername: string | null
}

export interface WalletLimitProfile {
  id: string
  userId: string
  username: string
  status: string
  walletType: string
  limitGroupId: string | null
}

export interface WalletLimitGroup {
  id: string
  code: string
  displayName: string
  createdAt: string
}

/** Thân request tạo mới/cập nhật: các ô số tùy chọn gửi `null` khi để trống. */
export interface WalletLimitPolicyBody {
  transactionType: WalletLimitTransactionType
  minPerTransaction: number
  maxPerTransaction: number
  dailyMaximum: number | null
  normalMonthlyMaximum: number | null
  specialMonthlyMaximum: number | null
  walletBalanceMaximum: number | null
  outflowDailyMaximum: number | null
  outflowMonthlyMaximum: number | null
  outboundMaxTimesPerDay: number | null
  approvalThreshold: number | null
  bankOverrides: Omit<
    WalletLimitBankOverride,
    'id' | 'policyId' | 'createdAt'
  >[]
}

export interface WalletLimitCreateBody extends WalletLimitPolicyBody {
  scopeType: WalletLimitScope
  targetId: string | null
  walletType: string
}

export interface WalletLimitUpdateBody extends WalletLimitPolicyBody {
  status: WalletLimitStatus
  rowVersion: number
}
