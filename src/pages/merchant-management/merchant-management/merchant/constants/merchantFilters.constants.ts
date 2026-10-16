import type { MerchantStatus } from '@type/merchant'

export const MERCHANT_FILTER_KEYS = [
  'name',
  'code',
  'taxCode',
  'status'
] as const
export type MerchantFilterKey = (typeof MERCHANT_FILTER_KEYS)[number]
export type MerchantFilters = Partial<Record<MerchantFilterKey, string>>
// MST của hộ kinh doanh cá thể chính là số CCCD nên không đưa lên URL.
export const MERCHANT_SENSITIVE_KEYS: readonly MerchantFilterKey[] = ['taxCode']

const MERCHANT_STATUSES: readonly MerchantStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'REJECTED',
  'LOCKED',
  'TERMINATED'
]

/** Giá trị trên URL do người dùng sửa được, nên chỉ nhận trạng thái hợp lệ. */
export const toMerchantStatus = (value?: string): MerchantStatus | undefined =>
  MERCHANT_STATUSES.find((status) => status === value)
