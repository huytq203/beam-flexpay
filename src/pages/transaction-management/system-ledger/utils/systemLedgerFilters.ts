import type { FormSearchValues } from '@type/systemLedger'

export const LEDGER_FILTER_KEYS = [
  'keyword',
  'transactionCode',
  'journalCode',
  'ownerUsername',
  'ownerType',
  'glCode',
  'direction',
  'transactionType',
  'minAmount',
  'maxAmount',
  'fromDate',
  'toDate'
] as const

export type LedgerFilterKey = (typeof LEDGER_FILTER_KEYS)[number]
export type LedgerUrlFilters = Partial<Record<LedgerFilterKey, string>>

/** Ô "Chủ tài khoản" nhận cả số điện thoại nên không được lên URL. */
// `keyword` nhận cả chủ tài khoản (SĐT/username) nên cũng không lên URL.
export const LEDGER_SENSITIVE_KEYS: readonly LedgerFilterKey[] = [
  'ownerUsername',
  'keyword'
]

const toAmount = (raw: string | undefined): number | undefined => {
  if (raw === undefined) return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Tham số trên URL luôn là chuỗi; số tiền phải đổi lại số cho form và API. */
export const toLedgerFilter = (filters: LedgerUrlFilters): FormSearchValues => {
  const { minAmount, maxAmount, ...rest } = filters
  const result: FormSearchValues = { ...rest }
  const min = toAmount(minAmount)
  const max = toAmount(maxAmount)
  if (min !== undefined) result.minAmount = min
  if (max !== undefined) result.maxAmount = max
  return result
}

/** Cắt khoảng trắng; ô trống bị hook lọc bỏ, không gửi rác xuống API. */
export const toLedgerUrlFilters = (
  values: FormSearchValues
): LedgerUrlFilters => {
  const result: LedgerUrlFilters = {}
  for (const key of LEDGER_FILTER_KEYS) {
    const value = values[key]
    if (typeof value === 'string') result[key] = value.trim()
    else if (typeof value === 'number') result[key] = String(value)
  }
  return result
}
