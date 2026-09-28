import type { ApiSubMerchant, ApiSubMerchantSummary, ApiTerminal, ApiTerminalSummary, HierarchyStatus } from '@/app/services/merchantHierarchyApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'

import type { SubMerchantRow, SubMerchantStatus } from '../sub-merchant/types/subMerchant.type'
import type { TerminalRow, TerminalStatus, TerminalType } from '../terminal/types/terminal.type'

const displayDate = (value?: string): string => formatUTCToLocalDateTime(value) || '—'

const status = (value: HierarchyStatus, lockSource?: 'DIRECT' | 'CASCADE'): SubMerchantStatus | TerminalStatus =>
  value === 'INACTIVE' && lockSource === 'CASCADE' ? 'SUSPENDED_BY_PARENT' : value

export const toSubMerchantRow = (source: ApiSubMerchantSummary | ApiSubMerchant): SubMerchantRow => {
  const detail = source as ApiSubMerchant
  return {
    id: source.id,
    code: source.code,
    name: source.name,
    parentMerchantId: source.merchantId,
    parentMerchantCode: source.merchantCode ?? '',
    parentMerchantName: source.merchantName ?? '',
    phone: source.phone?.value ?? '',
    email: '',
    address: detail.address?.value ?? '',
    businessField: detail.businessField ?? '',
    taxCode: detail.taxCode ?? '',
    legalRepresentative: detail.legalRepresentativeName ?? '',
    availableBalance: 0,
    collectedToday: 0,
    pendingSettlement: 0,
    settlementMode: 'AUTO',
    holdbackDays: 0,
    autoApprovalThreshold: 0,
    minimumWithdrawal: 0,
    dailyWithdrawalLimit: 0,
    isDefault: source.isDefault ?? false,
    phoneInherited: source.phone?.inherited ?? false,
    addressInherited: detail.address?.inherited ?? false,
    configurationSources: { bank: 'INHERITED', key: 'INHERITED', payment: 'INHERITED', notification: 'INHERITED' },
    maskedBankAccount: '',
    maskedIntegrationKey: '',
    status: status(source.status, source.lockSource) as SubMerchantStatus,
    createdAt: displayDate(source.createdAt),
    updatedAt: displayDate(detail.updatedAt)
  }
}

export const toTerminalRow = (source: ApiTerminalSummary | ApiTerminal): TerminalRow => {
  const detail = source as ApiTerminal
  const type: TerminalType = source.terminalType
  return {
    id: source.id,
    tid: source.tid,
    name: source.name,
    type,
    parentMerchantId: source.merchantId,
    parentMerchantCode: detail.merchantCode ?? '',
    parentMerchantName: detail.merchantName ?? '',
    subMerchantId: source.subMerchantId,
    subMerchantCode: source.subMerchantCode ?? '',
    subMerchantName: source.subMerchantName ?? '',
    address: source.address ?? '',
    phone: source.contactPhone?.value ?? '',
    note: detail.note ?? '',
    inheritedPaymentMethods: [],
    inheritedLimitLabel: '',
    status: status(source.status, source.lockSource) === 'SUSPENDED_BY_PARENT' ? 'SUSPENDED_BY_SUB' : status(source.status, source.lockSource) as TerminalStatus,
    createdAt: displayDate(source.createdAt),
    updatedAt: displayDate(detail.updatedAt)
  }
}
