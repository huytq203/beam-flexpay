import { SUB_MERCHANT_FIXTURES } from '../../sub-merchant/constants/subMerchant.fixture'
import type {
  TerminalRow,
  TerminalStatus,
  TerminalType
} from '../types/terminal.type'

export const TERMINAL_PAGE_SIZE = 10

export interface TerminalFiltersValue {
  query: string
  parentMerchantId?: string
  subMerchantId?: string
  type?: TerminalType
  status?: TerminalStatus
}

export interface TerminalSelectOption {
  label: string
  value: string
}

export const EMPTY_TERMINAL_FILTERS: TerminalFiltersValue = { query: '' }

const normalize = (value: string): string =>
  value.trim().toLocaleLowerCase('vi')

export const filterTerminals = (
  rows: readonly TerminalRow[],
  filters: TerminalFiltersValue
): TerminalRow[] => {
  const query = normalize(filters.query)

  return rows.filter((row) => {
    const matchesQuery =
      query === '' || normalize(`${row.tid} ${row.name}`).includes(query)
    return (
      matchesQuery &&
      (!filters.parentMerchantId ||
        row.parentMerchantId === filters.parentMerchantId) &&
      (!filters.subMerchantId || row.subMerchantId === filters.subMerchantId) &&
      (!filters.type || row.type === filters.type) &&
      (!filters.status || row.status === filters.status)
    )
  })
}

export const paginateTerminals = (
  rows: readonly TerminalRow[],
  page: number
): TerminalRow[] => {
  const start = (page - 1) * TERMINAL_PAGE_SIZE
  return rows.slice(start, start + TERMINAL_PAGE_SIZE)
}

export const getMerchantOptions = (): TerminalSelectOption[] => {
  const options = new Map<string, string>()
  SUB_MERCHANT_FIXTURES.forEach((row) => {
    options.set(row.parentMerchantId, row.parentMerchantName)
  })
  return Array.from(options, ([value, label]) => ({ value, label }))
}

export const getActiveSubMerchantOptions = (
  parentMerchantId?: string
): TerminalSelectOption[] =>
  SUB_MERCHANT_FIXTURES.filter(
    (row) =>
      row.status === 'ACTIVE' && row.parentMerchantId === parentMerchantId
  ).map((row) => ({ value: row.id, label: row.name }))

export const getTerminalTypeLabel = (type: TerminalType): string =>
  ({
    STATIC_QR: 'QR tĩnh',
    DYNAMIC_QR: 'QR động',
    POS: 'POS',
    SOFTPOS: 'SoftPOS'
  })[type]

export const hasTerminalFilters = (filters: TerminalFiltersValue): boolean =>
  Boolean(
    filters.query.trim() ||
    filters.parentMerchantId ||
    filters.subMerchantId ||
    filters.type ||
    filters.status
  )
