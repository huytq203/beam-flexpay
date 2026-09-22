import type { EntityStatus } from '../../shared/management.types'

export type SubMerchantStatus = Exclude<EntityStatus, 'SUSPENDED_BY_SUB'>

export type SettlementMode = 'AUTO' | 'MANUAL'

export type ConfigurationSource = 'INHERITED' | 'OVERRIDDEN'

export type ParentMerchantStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED'

export interface ParentMerchantConfigurationDefaults {
  readonly settlementMode: SettlementMode
  readonly holdbackDays: number
  readonly autoApprovalThreshold: number
  readonly minimumWithdrawal: number
  readonly dailyWithdrawalLimit: number
  readonly maskedBankAccount: string
  readonly maskedIntegrationKey: string
}

export interface ParentMerchantSource {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly status: ParentMerchantStatus
  readonly phone: string
  readonly address: string
  readonly taxCode: string
  readonly legalRepresentative: string
  readonly configurationDefaults: ParentMerchantConfigurationDefaults
}

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
