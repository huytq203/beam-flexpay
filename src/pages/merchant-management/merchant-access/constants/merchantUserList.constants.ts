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
