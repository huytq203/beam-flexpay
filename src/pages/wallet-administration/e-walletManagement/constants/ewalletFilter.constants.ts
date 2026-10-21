export const EWALLET_FILTER_KEYS = [
  'keyword',
  'ownerId',
  'status',
  'walletType',
  'fromDate',
  'toDate'
] as const

export type EwalletFilterKey = (typeof EWALLET_FILTER_KEYS)[number]

/** Ô "Người dùng" nhập số điện thoại: chỉ giữ trong sessionStorage, không lên URL. */
export const EWALLET_SENSITIVE_KEYS = [
  'keyword'
] as const satisfies readonly EwalletFilterKey[]
