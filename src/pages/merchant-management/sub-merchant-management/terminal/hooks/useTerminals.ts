import { useState, useSyncExternalStore } from 'react'

import type { ManagementListState } from '../../shared/management.types'
import { getSubMerchantPaymentConfiguration } from '../../sub-merchant/constants/subMerchantPaymentConfiguration'
import { TERMINAL_FIXTURES } from '../constants/terminal.fixture'
import type { TerminalFormValue } from '../schemas/terminal.schema'
import type { StoredTerminalRow, TerminalRow } from '../types/terminal.type'
import {
  EMPTY_TERMINAL_FILTERS,
  filterTerminals,
  paginateTerminals,
  TERMINAL_PAGE_SIZE,
  type TerminalFiltersValue
} from '../utils/terminal.utils'
import {
  getCurrentSubMerchant,
  useCurrentSubMerchants
} from './useTerminalSubMerchants'

type TerminalListener = () => void

const cloneSeeds = (): StoredTerminalRow[] => TERMINAL_FIXTURES.map((row) => ({ ...row }))

let records = cloneSeeds()
const listeners = new Set<TerminalListener>()
const emitChange = (): void => listeners.forEach((listener) => listener())
const subscribe = (listener: TerminalListener): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = (): readonly StoredTerminalRow[] => records

export const resetTerminalRepository = (): void => {
  records = cloneSeeds()
  emitChange()
}

const getStoredTerminalById = (id: string): StoredTerminalRow | undefined =>
  records.find((row) => row.id === id)

const withCurrentSub = (record: StoredTerminalRow): TerminalRow => {
  const sub = getCurrentSubMerchant(record.subMerchantId)
  if (!sub) {
    return { ...record, status: 'SUSPENDED_BY_SUB', inheritedPaymentMethods: [], inheritedLimitLabel: 'Không tìm thấy Sub-merchant cha' }
  }
  const configuration = getSubMerchantPaymentConfiguration(sub)
  return {
    ...record,
    subMerchantCode: sub.code,
    subMerchantName: sub.name,
    parentMerchantId: sub.parentMerchantId,
    parentMerchantCode: sub.parentMerchantCode,
    parentMerchantName: sub.parentMerchantName,
    inheritedPaymentMethods: [...configuration.methods],
    inheritedLimitLabel: configuration.limitLabel,
    status: sub.status !== 'ACTIVE' ? 'SUSPENDED_BY_SUB'
      : record.status === 'SUSPENDED_BY_SUB' ? 'ACTIVE' : record.status
  }
}

export const getTerminalById = (id: string): TerminalRow | undefined => {
  const record = getStoredTerminalById(id)
  return record ? withCurrentSub(record) : undefined
}

const hasActiveSubMerchant = (record: StoredTerminalRow): boolean =>
  getCurrentSubMerchant(record.subMerchantId)?.status === 'ACTIVE'

export const createTerminal = (value: TerminalFormValue): TerminalRow => {
  const sub = getCurrentSubMerchant(value.subMerchantId)
  if (!sub || sub.parentMerchantId !== value.parentMerchantId) {
    throw new Error('Sub-merchant không hợp lệ')
  }
  if (sub.status !== 'ACTIVE') throw new Error('Sub-merchant đang tạm ngưng')
  const sequence = String(records.length + 1).padStart(4, '0')
  const record: StoredTerminalRow = {
    id: `terminal-${Date.now()}-${sequence}`,
    tid: `TID-${sub.parentMerchantCode.slice(-4)}-${sequence}`,
    ...value,
    parentMerchantCode: sub.parentMerchantCode,
    parentMerchantName: sub.parentMerchantName,
    subMerchantCode: sub.code,
    subMerchantName: sub.name,
    status: 'ACTIVE',
    createdAt: '22/09/2026 09:00',
    updatedAt: '22/09/2026 09:00'
  }
  records = [...records, record]
  emitChange()
  return withCurrentSub(record)
}

export const updateTerminal = (
  id: string,
  value: TerminalFormValue
): TerminalRow | undefined => {
  const current = getStoredTerminalById(id)
  if (!current || !hasActiveSubMerchant(current)) return undefined
  const { name, type, address, phone, note } = value
  const updated = { ...current, name, type, address, phone, note, updatedAt: '22/09/2026 09:00' }
  records = records.map((row) => (row.id === id ? updated : row))
  emitChange()
  return withCurrentSub(updated)
}

export const changeTerminalStatus = (id: string, reason: string): boolean => {
  const current = getStoredTerminalById(id)
  if (!current || !hasActiveSubMerchant(current)) return false
  const currentStatus =
    current.status === 'SUSPENDED_BY_SUB' ? 'ACTIVE' : current.status
  const status = currentStatus === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
  records = records.map((row) =>
    row.id === id
      ? {
          ...row,
          status,
          lastLockReason: reason,
          updatedAt: '22/09/2026 09:00'
        }
      : row
  )
  emitChange()
  return true
}

export const useTerminalRecords = (): readonly TerminalRow[] => {
  const repositoryRecords = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  )
  useCurrentSubMerchants()
  return repositoryRecords.map(withCurrentSub)
}

export const useTerminal = (id?: string): TerminalRow | undefined => {
  const repositoryRecords = useTerminalRecords()
  return repositoryRecords.find((row) => row.id === id)
}

export interface UseTerminalsOptions {
  initialListState?: ManagementListState
}

export function useTerminals({ initialListState }: UseTerminalsOptions = {}) {
  const repositoryRecords = useTerminalRecords()
  const [filters, setCurrentFilters] = useState<TerminalFiltersValue>(
    EMPTY_TERMINAL_FILTERS
  )
  const [page, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(TERMINAL_PAGE_SIZE)
  const [stateOverride, setStateOverride] = useState(initialListState)
  const filteredRows = filterTerminals(repositoryRecords, filters)
  const maxPage = Math.max(
    1,
    Math.ceil(filteredRows.length / pageSize)
  )
  const effectivePage = Math.min(page, maxPage)
  const listState =
    stateOverride ?? (filteredRows.length === 0 ? 'empty' : 'success')

  const setFilters = (next: TerminalFiltersValue): void => {
    setCurrentFilters(next)
    setCurrentPage(1)
  }
  const resetFilters = (): void => setFilters(EMPTY_TERMINAL_FILTERS)
  const retry = (): void => setStateOverride(undefined)
  const setPage = (nextPage: number, nextSize = pageSize): void => {
    setCurrentPage(nextSize === pageSize ? nextPage : 1)
    setPageSize(nextSize)
  }

  return {
    rows: paginateTerminals(filteredRows, effectivePage, pageSize),
    total: filteredRows.length,
    page: effectivePage,
    pageSize,
    filters,
    listState,
    setFilters,
    resetFilters,
    setPage,
    retry,
    changeStatus: changeTerminalStatus
  }
}
