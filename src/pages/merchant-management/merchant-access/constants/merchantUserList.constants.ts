import type { MerchantUserStatus } from '../types/merchantAccess.types'

export interface UserFilters {
  query: string
  merchantId?: string
  subMerchantId?: string
  roleIds: string[]
  status?: MerchantUserStatus
  scope?: 'single' | 'multiple'
}

export const EMPTY_FILTERS: UserFilters = { query: '', roleIds: [] }

/** `roleIds` lưu dạng danh sách id nối bằng dấu phẩy. */
export const USER_FILTER_KEYS = [
  'query',
  'merchantId',
  'subMerchantId',
  'roleIds',
  'status',
  'scope'
] as const
export type UserFilterKey = (typeof USER_FILTER_KEYS)[number]

/** Từ khóa nhận cả SĐT/Email nên không được lên URL. */
export const USER_SENSITIVE_KEYS: readonly UserFilterKey[] = ['query']

export const STATUS_LABELS: Record<MerchantUserStatus, string> = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Bị khóa',
  PENDING: 'Chờ kích hoạt'
}

export const STATUS_COLORS: Record<MerchantUserStatus, string> = {
  ACTIVE: 'success',
  LOCKED: 'error',
  PENDING: 'warning'
}
