import type { EntityStatus } from '../../shared/management.types'

export type SubMerchantStatus = Exclude<EntityStatus, 'SUSPENDED_BY_SUB'>

export type SettlementMode = 'AUTO' | 'MANUAL'

export type ConfigurationSource = 'INHERITED' | 'OVERRIDDEN'

export interface SubMerchantConfigurationSources {
  bank: ConfigurationSource
  key: ConfigurationSource
  payment: ConfigurationSource
  notification: ConfigurationSource
}

export interface SubMerchantRow {
  id: string
  code: string
  name: string
  parentMerchantId: string
  parentMerchantCode: string
  parentMerchantName: string
  phone: string
  email: string
  address: string
  businessField: string
  taxCode: string
  legalRepresentative: string
  terminalCount: number
  availableBalance: number
  collectedToday: number
  pendingSettlement: number
  settlementMode: SettlementMode
  holdbackDays: number
  autoApprovalThreshold: number
  minimumWithdrawal: number
  dailyWithdrawalLimit: number
  isDefault: boolean
  phoneInherited: boolean
  addressInherited: boolean
  configurationSources: SubMerchantConfigurationSources
  maskedBankAccount: string
  maskedIntegrationKey: string
  status: SubMerchantStatus
  createdAt: string
  updatedAt: string
  lastLockReason?: string
}
