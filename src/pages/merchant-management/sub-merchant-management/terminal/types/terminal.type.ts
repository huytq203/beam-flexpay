import type { EntityStatus } from '../../shared/management.types'

export type TerminalType = 'STATIC_QR' | 'DYNAMIC_QR' | 'POS' | 'SOFTPOS'

export type TerminalStatus = Exclude<EntityStatus, 'SUSPENDED_BY_PARENT'>

export interface TerminalRow {
  id: string
  tid: string
  name: string
  type: TerminalType
  parentMerchantId: string
  parentMerchantCode: string
  parentMerchantName: string
  subMerchantId: string
  subMerchantCode: string
  subMerchantName: string
  address: string
  phone: string
  note: string
  inheritedPaymentMethods: string[]
  inheritedLimitLabel: string
  status: TerminalStatus
  createdAt: string
  updatedAt: string
  lastLockReason?: string
}

export type StoredTerminalRow = Omit<TerminalRow, 'inheritedPaymentMethods' | 'inheritedLimitLabel'>
