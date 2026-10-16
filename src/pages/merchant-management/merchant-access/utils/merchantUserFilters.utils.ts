import {
  STATUS_LABELS,
  type UserFilterKey,
  type UserFilters
} from '../constants/merchantUserList.constants'
import type { MerchantUserStatus } from '../types/merchantAccess.types'

type UserUrlFilters = Partial<Record<UserFilterKey, string>>

const isUserStatus = (value?: string): value is MerchantUserStatus =>
  value !== undefined && Object.hasOwn(STATUS_LABELS, value)

const toScope = (value?: string): UserFilters['scope'] =>
  value === 'single' || value === 'multiple' ? value : undefined

/** Giá trị lạ trên URL bị bỏ qua thay vì đẩy xuống API. */
export const fromUserUrlFilters = (raw: UserUrlFilters): UserFilters => ({
  query: raw.query ?? '',
  merchantId: raw.merchantId,
  subMerchantId: raw.subMerchantId,
  roleIds: raw.roleIds ? raw.roleIds.split(',').filter(Boolean) : [],
  status: isUserStatus(raw.status) ? raw.status : undefined,
  scope: toScope(raw.scope)
})

export const toUserUrlFilters = (filters: UserFilters): UserUrlFilters => ({
  query: filters.query.trim(),
  merchantId: filters.merchantId,
  subMerchantId: filters.subMerchantId,
  roleIds: filters.roleIds.join(','),
  status: filters.status,
  scope: filters.scope
})
