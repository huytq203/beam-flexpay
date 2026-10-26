export const TRANSACTION_FILTER_KEYS = [
  'transactionCode',
  'transactionType',
  'status',
  'partyUsername',
  'paymentMethod',
  'fromDate',
  'toDate',
  'hasRefund'
] as const

export type TransactionFilterKey = (typeof TRANSACTION_FILTER_KEYS)[number]

export type TransactionUrlFilters = Partial<
  Record<TransactionFilterKey, string>
>

/** Username tài khoản là số điện thoại: không đưa lên URL. */
export const TRANSACTION_SENSITIVE_KEYS = [
  'partyUsername'
] as const satisfies readonly TransactionFilterKey[]

/** Khoá loại giao dịch hoàn tiền trong `TransactionType`. */
export const REFUND_TRANSACTION_TYPE = 'REVERSAL'
