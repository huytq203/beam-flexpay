import { useState, useSyncExternalStore } from 'react'

import type { ManagementListState } from '../../shared/management.types'
import { SUB_MERCHANT_FIXTURES } from '../../sub-merchant/constants/subMerchant.fixture'
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

export const getTerminalById = (id: string): TerminalRow | undefined =>
  records.find((row) => row.id === id)

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
  const sub = SUB_MERCHANT_FIXTURES.find(
    (row) => row.id === value.subMerchantId && row.status === 'ACTIVE'
  )
  if (!sub || sub.parentMerchantId !== value.parentMerchantId) {
    throw new Error('Sub-merchant không hợp lệ')
  }
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
  const current = getTerminalById(id)
  if (!current || current.status === 'SUSPENDED_BY_SUB') return undefined
  const updated = { ...current, ...value, updatedAt: '22/09/2026 09:00' }
  records = records.map((row) => (row.id === id ? updated : row))
  emitChange()
  return updated
}

export const changeTerminalStatus = (id: string, reason: string): boolean => {
  const current = getTerminalById(id)
  if (!current || current.status === 'SUSPENDED_BY_SUB') return false
  const status = current.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
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

export const useTerminalRecords = (): readonly TerminalRow[] =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

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
  const listState =
    stateOverride ?? (filteredRows.length === 0 ? 'empty' : 'success')

  const setFilters = (next: TerminalFiltersValue): void => {
    setCurrentFilters(next)
    setPage(1)
  }
  const resetFilters = (): void => setFilters(EMPTY_TERMINAL_FILTERS)
  const retry = (): void => setStateOverride(undefined)

  return {
    rows: paginateTerminals(filteredRows, page),
    total: filteredRows.length,
    page,
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
