import { useState, useSyncExternalStore } from 'react'

import type { ManagementListState } from '../../shared/management.types'
import { TERMINAL_FIXTURES } from '../constants/terminal.fixture'
import type { TerminalFormValue } from '../schemas/terminal.schema'
import type { TerminalRow } from '../types/terminal.type'
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

const cloneSeeds = (): TerminalRow[] =>
  TERMINAL_FIXTURES.map((row) => ({
    ...row,
    inheritedPaymentMethods: [...row.inheritedPaymentMethods]
  }))

let records = cloneSeeds()
const listeners = new Set<TerminalListener>()
const emitChange = (): void => listeners.forEach((listener) => listener())
const subscribe = (listener: TerminalListener): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = (): readonly TerminalRow[] => records

export const resetTerminalRepository = (): void => {
  records = cloneSeeds()
  emitChange()
}

const getStoredTerminalById = (id: string): TerminalRow | undefined =>
  records.find((row) => row.id === id)

const withCurrentSubStatus = (record: TerminalRow): TerminalRow => {
  const subMerchant = getCurrentSubMerchant(record.subMerchantId)
  if (subMerchant && subMerchant.status !== 'ACTIVE') {
    return { ...record, status: 'SUSPENDED_BY_SUB' }
  }
  return record.status === 'SUSPENDED_BY_SUB'
    ? { ...record, status: 'ACTIVE' }
    : record
}

export const getTerminalById = (id: string): TerminalRow | undefined => {
  const record = getStoredTerminalById(id)
  return record ? withCurrentSubStatus(record) : undefined
}

const hasActiveSubMerchant = (record: TerminalRow): boolean =>
  getCurrentSubMerchant(record.subMerchantId)?.status === 'ACTIVE'

const getInheritedSettings = (subMerchantId: string) => {
  const source = records.find((row) => row.subMerchantId === subMerchantId)
  return {
    inheritedPaymentMethods: source
      ? [...source.inheritedPaymentMethods]
      : ['Theo cấu hình Sub-merchant'],
    inheritedLimitLabel:
      source?.inheritedLimitLabel ?? 'Áp dụng hạn mức của Sub-merchant'
  }
}

export const createTerminal = (value: TerminalFormValue): TerminalRow => {
  const sub = getCurrentSubMerchant(value.subMerchantId)
  if (!sub || sub.parentMerchantId !== value.parentMerchantId) {
    throw new Error('Sub-merchant không hợp lệ')
  }
  if (sub.status !== 'ACTIVE') throw new Error('Sub-merchant đang tạm ngưng')
  const sequence = String(records.length + 1).padStart(4, '0')
  const record: TerminalRow = {
    id: `terminal-${Date.now()}-${sequence}`,
    tid: `TID-${sub.parentMerchantCode.slice(-4)}-${sequence}`,
    ...value,
    parentMerchantCode: sub.parentMerchantCode,
    parentMerchantName: sub.parentMerchantName,
    subMerchantCode: sub.code,
    subMerchantName: sub.name,
    ...getInheritedSettings(sub.id),
    status: 'ACTIVE',
    createdAt: '22/09/2026 09:00',
    updatedAt: '22/09/2026 09:00'
  }
  records = [...records, record]
  emitChange()
  return record
}

export const updateTerminal = (
  id: string,
  value: TerminalFormValue
): TerminalRow | undefined => {
  const current = getStoredTerminalById(id)
  if (!current || !hasActiveSubMerchant(current)) return undefined
  const updated = { ...current, ...value, updatedAt: '22/09/2026 09:00' }
  records = records.map((row) => (row.id === id ? updated : row))
  emitChange()
  return updated
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
  return repositoryRecords.map(withCurrentSubStatus)
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
  const [page, setPage] = useState(1)
  const [stateOverride, setStateOverride] = useState(initialListState)
  const filteredRows = filterTerminals(repositoryRecords, filters)
  const maxPage = Math.max(
    1,
    Math.ceil(filteredRows.length / TERMINAL_PAGE_SIZE)
  )
  const effectivePage = Math.min(page, maxPage)
  const listState =
    stateOverride ?? (filteredRows.length === 0 ? 'empty' : 'success')

  const setFilters = (next: TerminalFiltersValue): void => {
    setCurrentFilters(next)
    setPage(1)
  }
  const resetFilters = (): void => setFilters(EMPTY_TERMINAL_FILTERS)
  const retry = (): void => setStateOverride(undefined)

  return {
    rows: paginateTerminals(filteredRows, effectivePage),
    total: filteredRows.length,
    page: effectivePage,
    pageSize: TERMINAL_PAGE_SIZE,
    filters,
    listState,
    setFilters,
    resetFilters,
    setPage,
    retry,
    changeStatus: changeTerminalStatus
  }
}
