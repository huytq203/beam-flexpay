import { useState, useSyncExternalStore } from 'react'
import type { Dayjs } from 'dayjs'

import type { ManagementListState } from '../../shared/management.types'
import {
  PARENT_MERCHANT_FIXTURES,
  SUB_MERCHANT_FIXTURES
} from '../constants/subMerchant.fixture'
import type { SubMerchantFormValue } from '../schemas/subMerchant.schema'
import type {
  ParentMerchantSource,
  SubMerchantConfigurationSources,
  SubMerchantRow,
  SubMerchantStatus
} from '../types/subMerchant.type'
import {
  filterSubMerchants,
  paginateSubMerchants,
  SUB_MERCHANT_PAGE_SIZE
} from '../utils/subMerchant.utils'

export interface SubMerchantFiltersValue {
  query: string
  parentMerchantId?: string
  status?: SubMerchantStatus
  createdRange?: [Dayjs, Dayjs]
}

export interface UseSubMerchantsOptions {
  initialListState?: ManagementListState
}

export const EMPTY_SUB_MERCHANT_FILTERS: SubMerchantFiltersValue = { query: '' }

const cloneRow = (row: SubMerchantRow): SubMerchantRow => ({
  ...row,
  configurationSources: { ...row.configurationSources }
})

let repositoryRows: readonly SubMerchantRow[] = SUB_MERCHANT_FIXTURES.map(cloneRow)
const projectEffectiveStatus = (row: SubMerchantRow): SubMerchantRow => {
  const parent = PARENT_MERCHANT_FIXTURES[row.parentMerchantId]
  if (parent?.status === 'ACTIVE' || !parent) return row
  return { ...row, status: 'SUSPENDED_BY_PARENT' }
}

let effectiveRows: readonly SubMerchantRow[] = repositoryRows.map(projectEffectiveStatus)
let nextSubMerchantSequence = SUB_MERCHANT_FIXTURES.length + 1
const listeners = new Set<() => void>()

const emitChange = (): void => {
  effectiveRows = repositoryRows.map(projectEffectiveStatus)
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const getSubMerchantSnapshot = (): readonly SubMerchantRow[] => effectiveRows

export const resetSubMerchantRepository = (): void => {
  repositoryRows = SUB_MERCHANT_FIXTURES.map(cloneRow)
  nextSubMerchantSequence = SUB_MERCHANT_FIXTURES.length + 1
  emitChange()
}

export const getSubMerchantById = (id: string): SubMerchantRow | undefined =>
  effectiveRows.find((row) => row.id === id)

const getStoredSubMerchantById = (id: string): SubMerchantRow | undefined =>
  repositoryRows.find((row) => row.id === id)

export const toggleSubMerchantStatus = (id: string, reason: string): boolean => {
  const record = getStoredSubMerchantById(id)
  const parent = record ? PARENT_MERCHANT_FIXTURES[record.parentMerchantId] : undefined
  if (!record || !parent || parent.status !== 'ACTIVE') return false

  repositoryRows = repositoryRows.map((row) =>
    row.id === id
      ? {
          ...row,
          status: row.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE',
          lastLockReason: reason,
          updatedAt: '22/09/2026 09:00'
        }
      : row
  )
  emitChange()
  return true
}

export const getParentMerchantById = (parentMerchantId: string): ParentMerchantSource | undefined =>
  PARENT_MERCHANT_FIXTURES[parentMerchantId]

const resolveParent = (parentMerchantId: string): ParentMerchantSource => {
  const parent = getParentMerchantById(parentMerchantId)
  if (!parent) throw new Error('Không tìm thấy Merchant cha')
  return parent
}

const INHERITED_CONFIGURATION_SOURCES: SubMerchantConfigurationSources = Object.freeze({
  bank: 'INHERITED',
  key: 'INHERITED',
  payment: 'INHERITED',
  notification: 'INHERITED'
})

export const createFixtureSubMerchant = (value: SubMerchantFormValue): SubMerchantRow => {
  const parent = resolveParent(value.parentMerchantId)
  if (parent.status !== 'ACTIVE') {
    throw new Error('Merchant cha phải đang hoạt động để tạo Sub-merchant')
  }
  const sequence = String(nextSubMerchantSequence).padStart(2, '0')
  const parentNumber = parent.code.replace(/^MC0*/, '').padStart(4, '0')
  const defaults = parent.configurationDefaults
  const record: SubMerchantRow = {
    id: `sub-local-${sequence}`,
    code: `SUB-${parentNumber}-${sequence}`,
    name: value.name,
    phone: value.phoneInherited ? parent.phone : value.phone,
    address: value.addressInherited ? parent.address : value.address,
    parentMerchantId: parent.id,
    parentMerchantCode: parent.code,
    parentMerchantName: parent.name,
    businessField: value.businessField,
    email: `sub-${sequence}@merchant.example.vn`,
    taxCode: parent.taxCode,
    legalRepresentative: parent.legalRepresentative,
    availableBalance: 0,
    collectedToday: 0,
    pendingSettlement: 0,
    settlementMode: defaults.settlementMode,
    holdbackDays: defaults.holdbackDays,
    autoApprovalThreshold: defaults.autoApprovalThreshold,
    minimumWithdrawal: defaults.minimumWithdrawal,
    dailyWithdrawalLimit: defaults.dailyWithdrawalLimit,
    isDefault: false,
    phoneInherited: value.phoneInherited,
    addressInherited: value.addressInherited,
    configurationSources: { ...INHERITED_CONFIGURATION_SOURCES },
    maskedBankAccount: defaults.maskedBankAccount,
    maskedIntegrationKey: defaults.maskedIntegrationKey,
    status: 'ACTIVE',
    createdAt: '22/09/2026',
    updatedAt: '22/09/2026 09:00',
    lastLockReason: undefined
  }
  nextSubMerchantSequence += 1
  repositoryRows = [record, ...repositoryRows]
  emitChange()
  return record
}

export const updateFixtureSubMerchant = (
  record: SubMerchantRow,
  value: SubMerchantFormValue
): SubMerchantRow => {
  const storedRecord = getStoredSubMerchantById(record.id)
  if (!storedRecord) throw new Error('Không tìm thấy Sub-merchant')
  const parent = resolveParent(storedRecord.parentMerchantId)
  if (parent.status !== 'ACTIVE') {
    throw new Error('Merchant cha phải đang hoạt động để cập nhật Sub-merchant')
  }
  const defaults = parent.configurationDefaults
  const inheritsBank = storedRecord.configurationSources.bank === 'INHERITED'
  const inheritsKey = storedRecord.configurationSources.key === 'INHERITED'
  const inheritsPayment = storedRecord.configurationSources.payment === 'INHERITED'
  const updated: SubMerchantRow = {
    ...storedRecord,
    name: value.name,
    phone: value.phoneInherited ? parent.phone : value.phone,
    address: value.addressInherited ? parent.address : value.address,
    businessField: value.businessField,
    taxCode: parent.taxCode,
    legalRepresentative: parent.legalRepresentative,
    phoneInherited: value.phoneInherited,
    addressInherited: value.addressInherited,
    maskedBankAccount: inheritsBank ? defaults.maskedBankAccount : storedRecord.maskedBankAccount,
    maskedIntegrationKey: inheritsKey ? defaults.maskedIntegrationKey : storedRecord.maskedIntegrationKey,
    settlementMode: inheritsPayment ? defaults.settlementMode : storedRecord.settlementMode,
    holdbackDays: inheritsPayment ? defaults.holdbackDays : storedRecord.holdbackDays,
    autoApprovalThreshold: inheritsPayment
      ? defaults.autoApprovalThreshold
      : storedRecord.autoApprovalThreshold,
    minimumWithdrawal: inheritsPayment
      ? defaults.minimumWithdrawal
      : storedRecord.minimumWithdrawal,
    dailyWithdrawalLimit: inheritsPayment
      ? defaults.dailyWithdrawalLimit
      : storedRecord.dailyWithdrawalLimit,
    updatedAt: '22/09/2026 09:00'
  }
  repositoryRows = repositoryRows.map((row) => (row.id === storedRecord.id ? updated : row))
  emitChange()
  return updated
}

export function useSubMerchantRecord(id?: string): SubMerchantRow | undefined {
  const rows = useAllSubMerchants()
  return rows.find((row) => row.id === id)
}

export function useAllSubMerchants(): readonly SubMerchantRow[] {
  return useSyncExternalStore(
    subscribe,
    getSubMerchantSnapshot,
    getSubMerchantSnapshot
  )
}

export function useSubMerchants({ initialListState }: UseSubMerchantsOptions = {}) {
  const records = useAllSubMerchants()
  const [filters, setFilterState] = useState(EMPTY_SUB_MERCHANT_FILTERS)
  const [page, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(SUB_MERCHANT_PAGE_SIZE)
  const [forcedState, setForcedState] = useState(initialListState)
  const filteredRows = filterSubMerchants(records, filters)
  const effectivePage = Math.min(page, Math.max(1, Math.ceil(filteredRows.length / pageSize)))
  const listState = forcedState ?? (filteredRows.length === 0 ? 'empty' : 'success')

  const setFilters = (value: SubMerchantFiltersValue): void => {
    setFilterState(value)
    setCurrentPage(1)
  }
  const resetFilters = (): void => setFilters(EMPTY_SUB_MERCHANT_FILTERS)
  const setPage = (nextPage: number, nextSize = pageSize): void => {
    setCurrentPage(nextSize === pageSize ? nextPage : 1)
    setPageSize(nextSize)
  }

  return {
    rows: paginateSubMerchants(filteredRows, effectivePage, pageSize),
    total: filteredRows.length,
    filters,
    setFilters,
    resetFilters,
    page: effectivePage,
    pageSize,
    setPage,
    listState,
    toggleStatus: toggleSubMerchantStatus,
    retry: () => setForcedState(undefined)
  }
}
