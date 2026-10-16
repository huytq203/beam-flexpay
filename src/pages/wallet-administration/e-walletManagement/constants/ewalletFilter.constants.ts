export const EWALLET_FILTER_KEYS = [
  'username',
  'ownerId',
  'status',
  'walletType',
  'fromDate',
  'toDate'
] as const

export type EwalletFilterKey = (typeof EWALLET_FILTER_KEYS)[number]

/** Ô "Người dùng" nhập số điện thoại: chỉ giữ trong sessionStorage, không lên URL. */
export const EWALLET_SENSITIVE_KEYS = [
  'username'
] as const satisfies readonly EwalletFilterKey[]
