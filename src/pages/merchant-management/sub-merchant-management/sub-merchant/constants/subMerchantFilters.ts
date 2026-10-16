import type { PickedEntity } from '@components/index'

import type { SubMerchantStatus } from '../types/subMerchant.type'

export interface SubMerchantFiltersValue {
  query: string
  parentMerchant?: PickedEntity
  status?: SubMerchantStatus
  // FormDatePicker trả về cặp chuỗi ngày giờ, bấm xóa thì trả chuỗi rỗng.
  createdRange?: [string, string] | ''
}

export const EMPTY_SUB_MERCHANT_FILTERS: SubMerchantFiltersValue = {
  query: ''
}

export const SUB_MERCHANT_STATUSES: readonly SubMerchantStatus[] = [
  'ACTIVE',
  'INACTIVE',
  'TERMINATED',
  'LOCKED',
  'SUSPENDED_BY_PARENT'
]

export const SUB_MERCHANT_FILTER_KEYS = [
  'query',
  'merchantId',
  'merchantCode',
  'merchantName',
  'status',
  'createdFrom',
  'createdTo'
] as const
export type SubMerchantFilterKey = (typeof SUB_MERCHANT_FILTER_KEYS)[number]
// Ô từ khóa gợi ý nhập số điện thoại nên không được lên URL.
export const SUB_MERCHANT_SENSITIVE_KEYS: readonly SubMerchantFilterKey[] = [
  'query'
]
