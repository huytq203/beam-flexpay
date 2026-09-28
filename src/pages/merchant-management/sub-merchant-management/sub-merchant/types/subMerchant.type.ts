import type { EntityStatus } from '../../shared/management.types'

export type SubMerchantStatus = Exclude<EntityStatus, 'SUSPENDED_BY_SUB'>

export interface SubMerchantRow {
  id: string
  code: string
  name: string
  parentMerchantId: string
  parentMerchantCode: string
  parentMerchantName: string
  phone: string
  isDefault: boolean
  status: SubMerchantStatus
  createdAt: string
  lastLockReason?: string
}
