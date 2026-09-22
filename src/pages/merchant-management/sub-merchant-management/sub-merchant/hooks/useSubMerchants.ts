import { useState, useSyncExternalStore } from 'react'
import type { Dayjs } from 'dayjs'

import type { ManagementListState } from '../../shared/management.types'
import { SUB_MERCHANT_FIXTURES } from '../constants/subMerchant.fixture'
import type { SubMerchantFormValue } from '../schemas/subMerchant.schema'
import type { SubMerchantRow, SubMerchantStatus } from '../types/subMerchant.type'
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
let nextSubMerchantSequence = SUB_MERCHANT_FIXTURES.length + 1
const listeners = new Set<() => void>()

const emitChange = (): void => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = (): readonly SubMerchantRow[] => repositoryRows

export const resetSubMerchantRepository = (): void => {
  repositoryRows = SUB_MERCHANT_FIXTURES.map(cloneRow)
  nextSubMerchantSequence = SUB_MERCHANT_FIXTURES.length + 1
  emitChange()
}

export const getSubMerchantById = (id: string): SubMerchantRow | undefined =>
  repositoryRows.find((row) => row.id === id)

export const toggleSubMerchantStatus = (id: string, reason: string): boolean => {
  const record = getSubMerchantById(id)
  if (!record || record.status === 'SUSPENDED_BY_PARENT') return false

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

const resolveParent = (parentMerchantId: string): SubMerchantRow => {
  const parent = repositoryRows.find((row) => row.parentMerchantId === parentMerchantId)
  if (!parent) throw new Error('Không tìm thấy Merchant cha')
  return parent
}

export const createFixtureSubMerchant = (value: SubMerchantFormValue): SubMerchantRow => {
  const parent = resolveParent(value.parentMerchantId)
  const sequence = String(nextSubMerchantSequence).padStart(2, '0')
  const parentNumber = parent.parentMerchantCode.replace(/^MC0*/, '').padStart(4, '0')
  const record: SubMerchantRow = {
    ...cloneRow(parent),
    id: `sub-local-${sequence}`,
    code: `SUB-${parentNumber}-${sequence}`,
    name: value.name,
    phone: value.phoneInherited ? parent.phone : value.phone,
    address: value.addressInherited ? parent.address : value.address,
    businessField: value.businessField,
    email: `sub-${sequence}@merchant.example.vn`,
    terminalCount: 0,
    availableBalance: 0,
    collectedToday: 0,
    pendingSettlement: 0,
    isDefault: false,
    phoneInherited: value.phoneInherited,
    addressInherited: value.addressInherited,
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
  const parent = resolveParent(record.parentMerchantId)
  const updated: SubMerchantRow = {
    ...record,
    name: value.name,
    phone: value.phoneInherited ? parent.phone : value.phone,
    address: value.addressInherited ? parent.address : value.address,
    businessField: value.businessField,
    phoneInherited: value.phoneInherited,
    addressInherited: value.addressInherited,
    updatedAt: '22/09/2026 09:00'
  }
  repositoryRows = repositoryRows.map((row) => (row.id === record.id ? updated : row))
  emitChange()
  return updated
}

export function useSubMerchantRecord(id?: string): SubMerchantRow | undefined {
  const rows = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return rows.find((row) => row.id === id)
}

export function useSubMerchants({ initialListState }: UseSubMerchantsOptions = {}) {
  const records = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const [filters, setFilterState] = useState(EMPTY_SUB_MERCHANT_FILTERS)
  const [page, setPage] = useState(1)
  const [forcedState, setForcedState] = useState(initialListState)
  const filteredRows = filterSubMerchants(records, filters)
  const listState = forcedState ?? (filteredRows.length === 0 ? 'empty' : 'success')

  const setFilters = (value: SubMerchantFiltersValue): void => {
    setFilterState(value)
    setPage(1)
  }
  const resetFilters = (): void => setFilters(EMPTY_SUB_MERCHANT_FILTERS)

  return {
    rows: paginateSubMerchants(filteredRows, page),
    total: filteredRows.length,
    filters,
    setFilters,
    resetFilters,
    page,
    pageSize: SUB_MERCHANT_PAGE_SIZE,
    setPage,
    listState,
    toggleStatus: toggleSubMerchantStatus,
    retry: () => setForcedState(undefined)
  }
}
